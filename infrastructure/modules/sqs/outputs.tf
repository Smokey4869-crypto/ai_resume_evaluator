output "queue_url" {
  value = aws_sqs_queue.file_processing.url
}

output "queue_arn" {
  value = aws_sqs_queue.file_processing.arn
}