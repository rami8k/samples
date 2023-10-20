terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  assume_role {
    role_arn = "arn:aws:iam::${var.target_account_id}:role/${var.target_role_name}"
  }
}

provider "aws" {
  alias  = "east"
  region = "us-east-1"
  assume_role {
    role_arn = "arn:aws:iam::${var.target_account_id}:role/${var.target_role_name}"
  }
}

resource "aws_route53_zone" "apigw_zone" {
  name = var.domain_name
  tags = var.tags
}

module "api" {
  source = "./api"
  providers = {
    aws = aws.east
  }
  env                 = var.env
  target_account_id   = var.target_account_id
  newrelic_account_id = var.newrelic_account_id
  auth_callback_url   = var.auth_callback_url
  tags                = var.tags
}

module "certificate" {
  source = "git::https://gitlab.domain.com/team/BU/terraform/certificate.git"
  providers = {
    aws = aws.east
  }
  domain  = var.domain_name
  zone_id = aws_route53_zone.apigw_zone.zone_id
  tags    = var.tags
}

module "domain" {
  source = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-domain-mapping.git"
  providers = {
    aws = aws.east
  }
  api_id                   = module.api.api_id
  stage_name               = "prod"
  domain                   = var.domain_name
  regional_certificate_arn = module.certificate.arn
  zone_id                  = aws_route53_zone.apigw_zone.zone_id
  tags                     = var.tags

  depends_on = [module.api]
}
