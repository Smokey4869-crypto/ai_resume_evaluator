output "lambda_errors_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.lambda_errors_alarm.arn
}

output "sqs_queue_depth_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.sqs_queue_depth_alarm.arn
}
