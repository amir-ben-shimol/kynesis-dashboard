enum ErrorCode {
	SFTP_CONNECTION = 1000,
	SFTP_DOWNLOAD_FILE,
	ATDATA_INVALID_PIXEL_DATA,
	SEND_SQS_MESSAGE,
	DELETE_SQS_MESSAGE,
	ATDATA_PARSE_CSV_FILE,
	BIGBDM_ACCESS_TOKEN_API,
	BIGBDM_ACCESS_TOKEN_INVALID,
	BIGBDM_WEBSITE_ID_COLLECTION,
	INVALID_LINKEDIN_URL_API_INDEX,
	LINKEDIN_URL_API_ONE,
	LINKEDIN_URL_API_ALL,
	VETRIC_ENRICHMENT,
	VETRIC_PROFILE_OVERVIEW_ENRICHMENT,
	VETRIC_COMPANY_DETAILS_ENRICHMENT,
	VETRIC_MISSING_COMPANY_UNIVERSAL_NAME,
	DYNAMODB_INVALID_ITEM,
	DYNAMODB_ACCESS,
	SLACK_SEND_MESSAGE,
	UPSERT_DB,
	REPOSITORY_STARGAZERS_COUNT,
	AWAIT_DOCKER_PROXIES_CONTAINER_HEALTH,
	GITHUB_API_RATE_LIMIT,
	GITHUB_API_STARGAZERS,
	GITHUB_API_STARGAZERS_INVALID,
	GITHUB_API_STARGAZER_DATA,
	GITHUB_API_STARGAZER_DATA_INVALID,
	GITHUB_API_STARGAZERS_COUNT,
}

export default ErrorCode;
