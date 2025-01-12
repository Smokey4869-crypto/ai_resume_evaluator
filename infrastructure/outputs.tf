output "s3_bucket_name" {
    value = module.s3_bucket.bucket_name
}

output "sqs_queue_url" {
    value = module.sqs_queue.queue_url
}

output "lambda_function_name" {
    value = module.lambda_function.function_name
}

output "dynamo_table_name" {
  value = module.dynamo_table.table_name
}
