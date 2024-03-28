resource "aws_sqs_queue" "pixel_api_enrichment_sqs_fifo" {
    # * For a FIFO (first-in-first-out) queue, the name must end with the .fifo suffix
  name                        = "pixel-api-enrichment-sqs.fifo"
  fifo_queue                  = true
  visibility_timeout_seconds = 30
  deduplication_scope = "queue"
  
  tags = merge(
    var.common_tags,
    {
      Name  = "${var.project}-Pixel-API-Enrichment-SQS"
      Stack = "Backend"
    }
  )
}

resource "aws_lambda_event_source_mapping" "event_source_mapping_to_enrichment" {
  event_source_arn = aws_sqs_queue.pixel_api_enrichment_sqs_fifo.arn
  function_name    = aws_lambda_function.pixel_enrichment_lambda.arn
}