data "archive_file" "lex_function" {
  type        = "zip"
  source_dir  = "./lambda"
  output_path = "./lambda.zip"
}


resource "aws_lambda_function" "lambda_function" {
  function_name    = "${local.project_name}-lambda"
  filename         = data.archive_file.lex_function.output_path
  source_code_hash = data.archive_file.lex_function.output_base64sha256
  handler          = "index.handler"
  role             = aws_iam_role.chatbot_role.arn
  runtime          = "nodejs20.x"
  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.dynamodb-table.name
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda_cloudwatch" {
  name              = "/aws/lambda/${aws_lambda_function.lambda_function.function_name}"
  retention_in_days = 1
}

locals {
  split_arn  = split(":", aws_cloudformation_stack.lex.outputs.BotAliasArn)
  account_id = element([for item in local.split_arn : item if length(item) == 12], 0)
  source_arn = "${substr(aws_cloudformation_stack.lex.outputs.BotAliasArn, 0, 56)}TSTALIASID"
}
#  source_arn = "arn:aws:lex:eu-west-2:xxxxxxxxxxx:bot-alias/XXXXXXXX/TSTALIASID"
resource "aws_lambda_permission" "allow_interaction_with_Lex" {
  depends_on     = [aws_cloudformation_stack.lex]
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.lambda_function.function_name
  principal      = "lexv2.amazonaws.com"
  source_arn     = local.source_arn
  source_account = local.account_id
}
