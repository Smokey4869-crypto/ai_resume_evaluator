variable "bucket_name" {
  description = "The name of the S3 bucket"
}

variable "queue_arn" {
  description = "The ARN of the SQS queue"
  type = string
}