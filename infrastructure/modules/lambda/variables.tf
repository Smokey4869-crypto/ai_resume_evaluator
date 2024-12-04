variable "lambda_name" {
  description = "Name of the Lambda function"
}

variable "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
}

variable "sqs_queue_url" {
  description = "The URL of the SQS queue"
}

variable "sqs_queue_arn" {
  description = "The ARN of the SQS queue"
}

variable "lambda_zip_path" {
  description = "Path to the Lambda deployment package (zip)"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "dlq_arn" {
  description = "The ARN of the DLQ queue"
  type        = string
}
