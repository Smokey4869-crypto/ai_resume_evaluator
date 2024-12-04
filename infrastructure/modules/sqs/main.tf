resource "aws_sqs_queue" "file_processing" {
    name = var.queue_name
    message_retention_seconds = 86400
}

resource "aws_sqs_queue_policy" "task_queue_policy" {
    queue_url = aws_sqs_queue.file_processing.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [{
            Effect = "Allow",
            Principal = {
                Service = "s3.amazonaws.com"
            },
            Action = "SQS:SendMessage",
            Resource = aws_sqs_queue.file_processing.arn,
            Condition = {
                ArnEquals = {
                    "aws:SourceArn" = var.bucket_arn
                }
            }
        }]
    })
}