data "aws_caller_identity" "current" {}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-exec-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Effect = "Allow"
      }
    ]
  })
}


resource "aws_lambda_function" "process_file" {
  function_name    = var.lambda_name
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  role             = aws_iam_role.lambda_exec.arn
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)

  environment {
    variables = {
      SQS_QUEUE_URL = var.sqs_queue_url
    }
  }

  dead_letter_config {
    target_arn = var.dlq_arn
  }

  lifecycle {
    ignore_changes = [dead_letter_config]
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_exec_policy_attach]
}

resource "aws_lambda_permission" "allow_s3_trigger" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_file.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

resource "aws_iam_policy" "lambda_exec_policy" {
  name        = "LambdaExecutionPolicy"
  description = "Permission for Lambda to access SQS, S3, CloudWatch and Textract"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # SQS Permission
      {
        Effect = "Allow",
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ],
        Resource = var.sqs_queue_arn
      },

      # S3 Read Permission
      {
        Effect   = "Allow",
        Action   = ["s3:GetObject"],
        Resource = "${var.s3_bucket_arn}/*"
      },

      # SQS Permission for Dead Letter Queue
      {
        Effect = "Allow",
        Action = [
          "sqs:SendMessage"
        ],
        Resource = var.dlq_arn
      },

      # Cloud Watch Logging Permission
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        Resource = "arn:aws:logs:*:*:*"
      },

      {
        Effect = "Allow",
        Action = [
          "textract:DetectDocumentText"
        ],
        Resource = "*"
      },
      {
        "Effect" : "Allow",
        "Action" : "bedrock:InvokeModel",
        "Resource" : "*"
      }

    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_exec_policy_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_exec_policy.arn
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.sqs_queue_arn
  function_name    = aws_lambda_function.process_file.arn

  batch_size = 10
  enabled    = true
}
