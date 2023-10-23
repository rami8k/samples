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

provider "aws" {
  alias  = "west"
  region = "us-west-2"
  assume_role {
    role_arn = "arn:aws:iam::${var.target_account_id}:role/${var.target_role_name}"
  }
}

resource "aws_route53_zone" "apigw_zone" {
  name = var.domain
  tags = var.tags
}

module "dynamo" {
  source = "./dynamo"
  providers = {
    aws = aws.east
  }
  replica_region      = "us-west-2"
  env                 = var.env
  target_account_id   = var.target_account_id
  bwrite_url          = var.bwrite_url
  newrelic_account_id = var.newrelic_account_id
  tags                       = var.tags
  vpc_id               = var.vpc_id_east
  vpc_private_subnets = var.vpc_private_subnets_east
}

module "api_east" {
  source = "./api"

  env                 = var.env
  target_account_id   = var.target_account_id
  domain              = var.domain
  zone_id             = aws_route53_zone.apigw_zone.zone_id
  newrelic_account_id = var.newrelic_account_id
  notification_topics = var.notification_topics_east
  tags                = var.tags
}

module "api_west" {
  source = "./api"
  providers = {
    aws = aws.west
  }
  env                 = var.env
  target_account_id   = var.target_account_id
  domain              = var.domain
  zone_id             = aws_route53_zone.apigw_zone.zone_id
  newrelic_account_id = var.newrelic_account_id
  notification_topics = var.notification_topics_west
  tags                = var.tags
}
