
resource "aws_iam_role" "chatbot_role" {
  name = "${local.project_name}-role"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["lexv2.amazonaws.com", "lambda.amazonaws.com"]
        }
      }
    ]
  })

  tags = {
    tag = "build-${local.project_name}"
  }
}


resource "aws_iam_role_policy_attachment" "test-attach" {
  count      = length(local.policy_arns)
  role       = aws_iam_role.chatbot_role.name
  policy_arn = local.policy_arns[count.index]
}

