resource "aws_s3_bucket" "file_upload" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_notification" "file_upload_notification" {
    bucket = aws_s3_bucket.file_upload.id

    queue {
        queue_arn = var.queue_arn
        events = ["s3:ObjectCreated:*"]
        filter_prefix = ""
    }
}