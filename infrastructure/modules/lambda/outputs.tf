output "function_name" {
  value = aws_lambda_function.process_file.function_name
}

output "sqs_lambda_event_source_mapping" {
  value = aws_lambda_event_source_mapping.sqs_trigger.id
}
