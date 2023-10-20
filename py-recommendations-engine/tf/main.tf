provider "aws" {
  region = "us-east-1"
  assume_role {
    role_arn = "arn:aws:iam::${var.target_account_id}:role/${var.target_role_name}"
  }
}

locals {
  bucket_name                   = "${var.bucket_name}-us-east-1-${var.target_account_id}"
  personalize_dataset_group_arn = "arn:aws:personalize:us-east-1:${var.target_account_id}:dataset-group/${var.personalize_dataset_group_name}"
  personalize_solution_arn      = "arn:aws:personalize:us-east-1:${var.target_account_id}:solution/${var.personalize_solution_name}"
  personalize_items_dataset_arn = "arn:aws:personalize:us-east-1:${var.target_account_id}:dataset/${var.personalize_dataset_group_name}/ITEMS"
}

module "infrastructure" {
  source = "./infrastructure"

  target_account_id       = var.target_account_id
  bucket_name             = local.bucket_name
  s3_logging_bucket_name  = var.s3_logging_bucket_name
  daily_billing_threshold = var.daily_billing_threshold
  alerts_email            = var.alerts_email
  tags                    = var.tags
}

module "database" {
  source = "./database"

  tags = var.tags
}

module "model-training" {
  source = "./model-training"

  target_account_id        = var.target_account_id
  application_name         = var.application_name
  notification_topics      = var.notification_topics
  s3_app_folder            = var.s3_app_folder
  bucket_name              = local.bucket_name
  personalize_solution_arn = local.personalize_solution_arn
  newrelic_account_id      = var.newrelic_account_id
  tags                     = var.tags
}

module "items-job" {
  source = "./items-job"

  target_account_id             = var.target_account_id
  application_name              = var.application_name
  notification_topics           = var.notification_topics
  personalize_solution_arn      = local.personalize_solution_arn
  personalize_items_dataset_arn = local.personalize_items_dataset_arn
  bwrite_url                    = var.bwrite_url
  newrelic_account_id           = var.newrelic_account_id
  tags                          = var.tags
}

module "tasks" {
  source = "./tasks"

  target_account_id             = var.target_account_id
  image                         = "586143427371.dkr.ecr.us-east-1.amazonaws.com/${var.team_name}/${var.application_name}:${var.env}"
  bucket_name                   = local.bucket_name
  bwrite_url                    = var.bwrite_url
  application_name              = var.application_name
  personalize_solution_name     = var.personalize_solution_name
  personalize_dataset_group_arn = local.personalize_dataset_group_arn
  personalize_solution_arn      = local.personalize_solution_arn
  initial_solution_data_folder  = var.initial_solution_data_folder
  vpc                           = var.vpc
  tags                          = var.tags
}

resource "aws_route53_zone" "apigw_zone" {
  name = var.domain_name
  tags = var.tags
}

module "api_gw" {
  source = "./api"

  env                           = var.env
  target_account_id             = var.target_account_id
  application_name              = var.application_name
  personalize_solution_arn      = local.personalize_solution_arn
  personalize_dataset_group_arn = local.personalize_dataset_group_arn
  notification_topics           = var.notification_topics
  newrelic_account_id           = var.newrelic_account_id
  tags                          = var.tags
}

module "certificate" {
  source = "git::https:///terraform/certificate.git"

  domain_name = var.domain_name
  zone_id     = aws_route53_zone.apigw_zone.zone_id
  depends_on  = [aws_route53_zone.apigw_zone]
  tags        = var.tags
}

module "api_domain" {
  source = "./api/domain"

  api_id          = module.api_gw.api_id
  stage_name      = "prod"
  domain_name     = var.domain_name
  certificate_arn = module.certificate.certificate_arn
  zone_id         = aws_route53_zone.apigw_zone.zone_id
  depends_on      = [aws_route53_zone.apigw_zone]
  tags            = var.tags
}

module "api_domain_west" {
  source = "git::https:///terraform/api-gateway-domain-mapping.git"

  api_id                   = module.api_west.api_id
  stage_name               = "prod"
  domain                   = var.domain_name
  regional_certificate_arn = module.certificate.arn
  zone_id                  = aws_route53_zone.apigw_zone.zone_id
  tags                     = var.tags
}
