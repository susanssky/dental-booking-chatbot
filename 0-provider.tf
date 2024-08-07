provider "aws" {}


terraform {
  backend "s3" {
    bucket = "cloud-projects-tfstate"
    key    = "1-chatbot.tfstate"
    region = "eu-west-2"
  }
}
