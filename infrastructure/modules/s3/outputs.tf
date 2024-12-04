output "bucket_name" {
  value = aws_s3_bucket.file_upload.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.file_upload.arn
}