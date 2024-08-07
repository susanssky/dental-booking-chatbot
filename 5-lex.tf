resource "aws_cloudformation_stack" "lex" {
  depends_on    = [aws_iam_role.chatbot_role, aws_lambda_function.lambda_function]
  name          = "${local.project_name}-lex"
  template_body = file("5-lex.yaml")
  parameters = {
    IamRoleArn = aws_iam_role.chatbot_role.arn
    LambdaArn  = aws_lambda_function.lambda_function.arn
    BotName    = "dentalBooking"
  }
}

# BUG: resource "aws_lexv2models_slot_type"
# https://github.com/hashicorp/terraform-provider-aws/issues/36849
# resource "aws_lexv2models_bot" "dentalBooking" {
#   name = "dentalBooking"
#   data_privacy {
#     child_directed = false
#   }
#   idle_session_ttl_in_seconds = 300
#   role_arn                    = aws_iam_role.chatbot_role.arn

#   tags = {
#     Name = "dentalAppointment"
#   }
# }
# resource "aws_lexv2models_bot_locale" "dentalBooking" {
#   bot_id                           = aws_lexv2models_bot.dentalBooking.id
#   bot_version                      = "DRAFT"
#   locale_id                        = "en_GB"
#   n_lu_intent_confidence_threshold = 0.40

#   voice_settings {
#     voice_id = "Amy"
#     engine   = "neural"
#   }
# }
# resource "aws_lexv2models_bot_version" "dentalBooking" {
#   bot_id = aws_lexv2models_bot.dentalBooking.id
#   locale_specification = {
#     "en_GB" = {
#       source_bot_version = "DRAFT"
#     }
#   }
# }

# # so far, there is not any fixed for resource "aws_lexv2models_slot_type" when adding the slot value
# # https://github.com/hashicorp/terraform-provider-aws/issues/36849
# #
# variable "slot_type_names" {
#   default = [
#     "action",
#     "service",
#     "appointmentTime"
#   ]
# }
# resource "aws_lexv2models_slot_type" "slot_type_name" {
#   count       = length(var.slot_type_names)
#   bot_id      = aws_lexv2models_bot.dentalBooking.id
#   bot_version = aws_lexv2models_bot_locale.dentalBooking.bot_version
#   name        = var.slot_type_names[count.index]
#   locale_id   = aws_lexv2models_bot_locale.dentalBooking.locale_id
#   value_selection_setting {
#     resolution_strategy = "OriginalValue"
#     # advanced_recognition_setting {
#     #   audioRecognitionStrategy = "UseSlotValuesAsCustomVocabulary"
#     # }
#   }
#   # slot_type_values {
#   #   sample_value {
#   #     value = "tt"
#   #   }
#   # }
# }

# resource "aws_lexv2models_intent" "dentalBooking" {
#   bot_id      = aws_lexv2models_bot.dentalBooking.id
#   bot_version = aws_lexv2models_bot_locale.dentalBooking.bot_version
#   name        = "bookingIntent"
#   locale_id   = aws_lexv2models_bot_locale.dentalBooking.locale_id
# }
# resource "aws_lexv2models_slot" "dentalBooking" {
#   bot_id      = aws_lexv2models_bot.dentalBooking.id
#   bot_version = aws_lexv2models_bot_version.dentalBooking.bot_version
#   intent_id   = aws_lexv2models_intent.dentalBooking.id
#   locale_id   = aws_lexv2models_bot_locale.dentalBooking.locale_id
#   name        = "example"
# }




