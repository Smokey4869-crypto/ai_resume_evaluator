output "queue_url" {
  value = aws_sqs_queue.file_processing.url
}

output "queue_arn" {
  value = aws_sqs_queue.file_processing.arn
}

output "queue_name" {
  value = aws_sqs_queue.file_processing.name
}

output "dlq_arn" {
  value = aws_sqs_queue.dlq.arn
}

output "dlq_url" {
  value = aws_sqs_queue.dlq.id
}
