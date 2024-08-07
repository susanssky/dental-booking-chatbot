resource "aws_dynamodb_table" "dynamodb-table" {
  name                        = "${local.project_name}-table"
  billing_mode                = "PROVISIONED"
  read_capacity               = 5
  write_capacity              = 5
  hash_key                    = "id"
  deletion_protection_enabled = false

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    tag = "build-${local.project_name}"
  }
}
