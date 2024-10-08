module "atdata_pixel_collector" {
  source = "./modules/cron-lambda-to-sqs"

  project                         = var.project
  name                            = "AtData-Pixel-Collector"
  cron_job_schedule_expression    = "0 * * * *"
  archive_file_lambda_source_dir  = "${path.module}/../apps/atdata-pixel-collector-function/build"
  archive_file_lambda_output_path = "${path.module}/atdata-pixel-collector-function.zip"
  s3_bucket_id_lambda_storage     = module.s3_bucket_lambdas_code.s3_bucket_id
  lambda_timeout                  = 20
  lambda_runtime_envs = {
    SQS_URL              = aws_sqs_queue.pixel_enrichment_sqs_fifo.url
    ATDATA_PIXEL_ID      = var.atdata_pixel_id
    ATDATA_SFTP_HOST     = var.atdata_sftp_host
    ATDATA_SFTP_PORT     = var.atdata_sftp_port
    ATDATA_SFTP_USERNAME = var.atdata_sftp_username
    ATDATA_SFTP_PASSWORD = var.atdata_sftp_password
  }
  sqs_arn = aws_sqs_queue.pixel_enrichment_sqs_fifo.arn

  common_tags = merge(
    var.common_tags,
    {
      Stack     = "Backend"
      Namespace = "PixelAPI"
    }
  )
}