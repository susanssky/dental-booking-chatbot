resource "aws_cloudformation_stack" "connect_instance" {
  depends_on    = [aws_cloudformation_stack.lex]
  name          = "${local.project_name}-connect"
  template_body = file("6-connect.yaml")
  parameters = {
    # Because the instance is deleted after repeated reconstruction, an independent value (date and time) is added, otherwise the reconstruction still cannot be entered using the normal method.
    ConnectName = "${local.project_name}-${formatdate("YYYYMMDDhhmm", timestamp())}"
    LexArn      = local.source_arn
  }
}
# BUG: resource "aws_connect_instance"
# https://github.com/hashicorp/terraform-provider-aws/issues/38115
# resource "aws_connect_instance" "dentalBooking" {
#   identity_management_type = "CONNECT_MANAGED"
#   inbound_calls_enabled    = false
#   outbound_calls_enabled   = false
#   instance_alias           = "dentalBooking"
# }
# output "see-connect" {
#   value = aws_connect_instance.dentalBooking.arn
# }
data "aws_connect_security_profile" "security_profile_admin" {
  instance_id = aws_cloudformation_stack.connect_instance.outputs.ConnectId
  name        = "Admin"
}
data "aws_connect_routing_profile" "basic_routing" {
  instance_id = aws_cloudformation_stack.connect_instance.outputs.ConnectId
  name        = "Basic Routing Profile"
}
resource "aws_connect_user" "admin" {
  instance_id        = aws_cloudformation_stack.connect_instance.outputs.ConnectId
  name               = "admin"
  password           = var.connect_pw
  routing_profile_id = data.aws_connect_routing_profile.basic_routing.routing_profile_id

  security_profile_ids = [
    data.aws_connect_security_profile.security_profile_admin.security_profile_id
  ]

  identity_info {
    first_name = "admin"
    last_name  = "admin"
  }

  phone_config {
    after_contact_work_time_limit = 0
    phone_type                    = "SOFT_PHONE"
  }
}
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/connect_contact_flow#with-external-content
# resource "aws_connect_contact_flow" "test" {
#   instance_id  = aws_cloudformation_stack.connect.outputs.ConnectId
#   name         = "practiceFlow"
#   description  = "Test Contact Flow Description"
#   type         = "CONTACT_FLOW"
#   filename     = "6-contact_flow.json"
#   content_hash = filebase64sha256("6-contact_flow.json")
#   tags = {
#     "Name"        = "Test Contact Flow",
#     "Application" = "Terraform",
#     "Method"      = "Create"
#   }
# }


########################################
# After completing terraform, you must return to the amazon connect page of AWS and press Flows, and then join the amazon Lex bot, otherwise the bot on the front end will not work.
resource "null_resource" "associate_bot" {
  provisioner "local-exec" {
    command = "aws connect associate-bot --instance-id ${aws_cloudformation_stack.connect_instance.outputs.ConnectId} --lex-v2-bot AliasArn=${local.source_arn}"
  }

  depends_on = [aws_cloudformation_stack.connect_instance]
}
