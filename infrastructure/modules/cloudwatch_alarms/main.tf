resource "aws_cloudwatch_metric_alarm" "lambda_errors_alarm" {
  alarm_name                = "LambdaErrorsAlarm-${var.lambda_function_name}"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = 1
  metric_name               = "Errors"
  namespace                 = "AWS/Lambda"
  period                    = 60
  statistic                 = "Sum"
  threshold                 = 1
  alarm_actions             = var.alarm_actions
  dimensions = {
    FunctionName = var.lambda_function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "sqs_queue_depth_alarm" {
  alarm_name                = "SQSQueueDepthAlarm-${var.sqs_queue_name}"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = 1
  metric_name               = "ApproximateNumberOfMessagesVisible"
  namespace                 = "AWS/SQS"
  period                    = 60
  statistic                 = "Sum"
  threshold                 = 10
  alarm_actions             = var.alarm_actions
  dimensions = {
    QueueName = var.sqs_queue_name
  }
}
