variable "queue_name" {
  description = "The name of the SQS queue"
}

variable "bucket_arn" {
    description = "The ARN of the S3 bucket"
    type = string
}