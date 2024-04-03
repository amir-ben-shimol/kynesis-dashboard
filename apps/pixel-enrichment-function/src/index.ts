import type { SQSHandler } from 'aws-lambda';
import { SQSClient, SendMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { WebClient } from '@slack/web-api';

import type { SqsBody } from './interfaces/sqs-body';
import { linkedinUrlApis } from './data/linkedin-url-apis';
import { getEnrichedData } from './apis/vetric/vetric';
import LoggerService from './services/logger';
import { MAX_ATTEMPTS } from './constants/dynamodb';

export const handler: SQSHandler = async (event, context) => {
	const logger = new LoggerService(context.awsRequestId);

	// * As the ownership of the SQS is Kynesis, it will have valid message body
	const sqsMessage = event.Records[0]!;
	const messageBody = sqsMessage.body;
	const parsedMessageBody = JSON.parse(messageBody) as SqsBody;

	const sqsClient = new SQSClient({ region: process.env.AWS_REGION, maxAttempts: 3 });
	const deleteMessageSqsCommand = new DeleteMessageCommand({ QueueUrl: process.env.SQS_URL, ReceiptHandle: sqsMessage.receiptHandle });

	/**
	 * * Immediately delete the message because if processing it will fail, we just continue on to next API
	 * * we don't want to handle same message twice
	 */
	sqsClient
		.send(deleteMessageSqsCommand)
		.then(() => {
			logger.info('Successfully deleted SQS message');
		})
		.catch((error) => {
			logger.warn(`Failed to delete SQS message with an error: ${error}`);
		});

	logger.info(`Start processing SQS message with body: ${messageBody}`);

	if (parsedMessageBody.apiIndex >= linkedinUrlApis.length) {
		logger.error('Got invalid index to process, abort process');

		return;
	}

	const apiHandler = linkedinUrlApis[parsedMessageBody.apiIndex]!;
	let linkedinUrl: string;

	try {
		linkedinUrl = await apiHandler.getLinkedinUrl(parsedMessageBody);
	} catch (error: unknown) {
		logger.error(`Failed to match Linkedin profile URL with pixel data, with an error: ${error}`);

		if (parsedMessageBody.apiIndex === linkedinUrlApis.length - 1) {
			logger.error('Failed to match Linkedin profile URL using all APIs providers');

			return;
		}

		// * Increment "apiIndex" to handle next API handler
		const sendMessageSqsCommand = new SendMessageCommand({
			QueueUrl: process.env.SQS_URL,
			MessageBody: JSON.stringify({ ...parsedMessageBody, apiIndex: parsedMessageBody.apiIndex + 1 }),
			MessageGroupId: `${parsedMessageBody.email}#${parsedMessageBody.originDomain}`,
		});

		try {
			await sqsClient.send(sendMessageSqsCommand);
		} catch (error: unknown) {
			logger.error(`Failed to send SQS message with an error: ${error}`);

			return;
		}

		logger.info('Successfully pushed message to SQS to be handled');

		return;
	}

	let enrichedData: Record<string, unknown>;

	try {
		enrichedData = await getEnrichedData(context.awsRequestId, linkedinUrl);
	} catch (error) {
		logger.error(`Failed to enrich data with an error: ${error}`);

		return;
	}

	logger.info('Successfully enriched data for Linkedin Profile');

	const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION, maxAttempts: MAX_ATTEMPTS });

	const getItemCommand = new GetItemCommand({
		TableName: process.env.DYNAMODB_TABLE_NAME,
		Key: {
			CustomerDomain: { S: parsedMessageBody.originDomain },
		},
	});

	let customerSlackChannelId: string;

	try {
		const customerSlackItem = await dynamoDbClient.send(getItemCommand);

		if (!customerSlackItem.Item) {
			logger.error("Failed to retrieve customer's Slack channel ID from DynamoDB");

			return;
		}

		customerSlackChannelId = customerSlackItem.Item['CustomerSlackChannelId']!.S!;
	} catch (error: unknown) {
		logger.error(`Failed to get item from DynamoDB with an error: ${error}`);

		return;
	}

	logger.info(`Retrieved customer's Slack channel ID: "${customerSlackChannelId}"`);

	const slackClient = new WebClient(process.env.SLACK_TOKEN);

	try {
		await slackClient.chat.postMessage({
			text: JSON.stringify(enrichedData),
			channel: customerSlackChannelId,
		});
	} catch (error: unknown) {
		logger.error(`Failed to send message to customer's Slack channel with an error: ${error}`);

		return;
	}

	logger.info("Successfully sent data to customer's Slack channel");
};
