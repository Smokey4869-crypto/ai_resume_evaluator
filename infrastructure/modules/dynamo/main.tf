resource "aws_dynamodb_table" "jd_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "jdId"
    type = "S"
  }

  hash_key = "jdId"
}
