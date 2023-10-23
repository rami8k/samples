terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

data "aws_region" "current" {}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "logs:PutLogEvents",
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords"
    ]
    resources = ["*"]
  }
}

module "app_views_lambda" {
  source        = "git::https://gitlab.domain.com/team/app/terraform/lambda.git?ref=2.2.0"
  function_name = "app-views-service-handler"
  runtime       = "nodejs12.x"
  timeout       = 60
  filename      = "../api-service-lambda.zip"
  role_policies = [data.aws_iam_policy_document.lambda_policy.json]
  environment_variables = {
    NODE_ENV = "production"
  }
  tags = var.tags
}

resource "aws_api_gateway_rest_api" "apigw" {
  name = "app-views"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  tags = var.tags
}

module "cors" {
  source = "git::https://gitlab.domain.com/team/app/terraform/rest-api-gateway-cors.git?ref=1.0.0"

  rest_api_id      = aws_api_gateway_rest_api.apigw.id
  root_resource_id = aws_api_gateway_rest_api.apigw.root_resource_id
}

resource "aws_api_gateway_stage" "apigw_stage" {
  stage_name            = "prod"
  rest_api_id           = aws_api_gateway_rest_api.apigw.id
  deployment_id         = aws_api_gateway_deployment.apigw_deployment.id
  cache_cluster_enabled = true
  cache_cluster_size    = 0.5
  tags                  = var.tags
}

resource "aws_api_gateway_resource" "error" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "error"
}

module "error_route" {
  source          = "git::https://gitlab.domain.com/team/app/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.error.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "GET"
  integration_uri = module.app_views_lambda.invoke_arn
}

module "authorizer" {
  source = "./authorizer"
  api_id = aws_api_gateway_rest_api.apigw.id
  tags   = var.tags
}

resource "aws_api_gateway_resource" "history" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "history"
}

module "history_route" {
  source          = "git::https://gitlab.domain.com/team/app/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.history.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "GET"
  authorizer_id   = module.authorizer.authorizer_id
  integration_uri = module.app_views_lambda.invoke_arn
}

resource "aws_api_gateway_resource" "view" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "view"
}

module "article_view_route" {
  source      = "git::https://gitlab.domain.com/team/app/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.view.id
  stage_name  = aws_api_gateway_stage.apigw_stage.stage_name
  http_method = "POST"
  # authorizer_id = module.authorizer.authorizer_id
  integration_uri = module.app_views_lambda.invoke_arn
}

resource "aws_api_gateway_resource" "popular" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "popular"
}

module "popular_route" {
  source      = "git::https://gitlab.domain.com/team/app/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.popular.id
  stage_name  = aws_api_gateway_stage.apigw_stage.stage_name
  # cache_ttl       = 300
  http_method     = "GET"
  integration_uri = module.app_views_lambda.invoke_arn
  # cache_key_parameters = [
  #   "method.request.querystring.channel",
  #   "method.request.querystring.count",
  #   "method.request.header.origin"
  # ]
  # request_parameters = {
  #   "method.request.querystring.channel" = false
  #   "method.request.querystring.count"   = false
  #   "method.request.header.origin"       = false
  # }
}

resource "aws_api_gateway_resource" "healthcheck" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "healthcheck"
}

module "healthcheck_route" {
  source          = "git::https://gitlab.domain.com/team/app/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.healthcheck.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "GET"
  integration_uri = module.app_views_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "apigw_deployment" {
  rest_api_id       = aws_api_gateway_rest_api.apigw.id
  stage_description = "Deployed at: ${timestamp()}"

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  allowed_hosts = [format("%s.execute-api.%s.amazonaws.com", aws_api_gateway_rest_api.apigw.id, data.aws_region.current.name)]
}

module "certificate" {
  source  = "git::https://gitlab.domain.com/team/app/terraform/certificate.git?ref=2.0.0"
  domain  = var.domain
  zone_id = var.zone_id
  tags    = var.tags
}

module "domain" {
  source                   = "git::https://gitlab.domain.com/team/app/terraform/api-gateway-domain-mapping.git?ref=1.1.0"
  api_id                   = aws_api_gateway_rest_api.apigw.id
  stage_name               = "prod"
  domain                   = var.domain
  regional_certificate_arn = module.certificate.arn
  zone_id                  = var.zone_id
  tags                     = var.tags
}

module "waf" {
  source       = "git::https://gitlab.domain.com/team/app/terraform/waf.git?ref=2.0.0"
  resource_arn = aws_api_gateway_stage.apigw_stage.arn
  name         = "app-views-waf"
  rate_limit   = 100
  # allowed_hosts = local.allowed_hosts
  tags = var.tags
}
