variable "lambda_function_name" {
  description = "The name of the Lambda function to monitor"
  type        = string
}

variable "sqs_queue_name" {
  description = "The name of the SQS queue to monitor"
  type        = string
}

variable "alarm_actions" {
  description = "List of ARNs to notify when the alarm triggers"
  type        = list(string)
  default     = []
}
