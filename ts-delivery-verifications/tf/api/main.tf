terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

data "aws_region" "current" {}

data "aws_iam_policy_document" "dynamodb" {
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

data "aws_iam_policy_document" "ssm" {
  statement {
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      "arn:aws:ssm:us-east-1:${var.target_account_id}:parameter/BU*",
      "arn:aws:ssm:us-east-1:${var.target_account_id}:parameter/team*"
    ]
  }
}

module "lambda" {
  source        = "git::https://gitlab.domain.com/team/BU/terraform/lambda.git?ref=2.3.1"
  function_name = "BU-emails-delivery-validation"
  runtime       = "nodejs14.x"
  handler       = "lambda.handler"
  timeout       = 900
  memory_size   = 256
  filename      = "../api-service-lambda.zip"
  tags          = var.tags

  role_policies = [
    data.aws_iam_policy_document.dynamodb.json,
    data.aws_iam_policy_document.ssm.json
  ]
  environment_variables = {
    ENV               = "production"
    AWS               = true
    AUTH_CALLBACK_URL = var.auth_callback_url
  }
}

resource "aws_api_gateway_rest_api" "apigw" {
  name = "email-delivery-verification"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  tags = var.tags
}

resource "aws_api_gateway_stage" "apigw_stage" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  deployment_id = aws_api_gateway_deployment.apigw_deployment.id
  tags = merge(
    var.tags
  )
}

module "pass_authorizer_lambda" {
  source            = "./pass-authorizer"
  target_account_id = var.target_account_id
  tags              = var.tags
}

module "pass_authorizer" {
  source            = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-authorizer.git?ref=1.0.0"
  name              = "BU-edv-pass-authorizer"
  apigw_id          = aws_api_gateway_rest_api.apigw.id
  lambda_arn        = module.pass_authorizer_lambda.lambda_arn
  lambda_invoke_arn = module.pass_authorizer_lambda.lambda_invoke_arn
  tags              = var.tags
}

resource "aws_api_gateway_resource" "register" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "register"
}

module "register_route" {
  source          = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.register.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "GET"
  authorizer_id   = module.pass_authorizer.authorizer_id
  integration_uri = module.lambda.invoke_arn
}

module "jwt_authorizer_lambda" {
  source            = "./jwt-authorizer"
  target_account_id = var.target_account_id
  tags              = var.tags
}

module "jwt_authorizer" {
  source            = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-authorizer.git?ref=1.0.0"
  name              = "BU-edv-jwt-authorizer"
  apigw_id          = aws_api_gateway_rest_api.apigw.id
  lambda_arn        = module.jwt_authorizer_lambda.lambda_arn
  lambda_invoke_arn = module.jwt_authorizer_lambda.lambda_invoke_arn
  tags              = var.tags
}

resource "aws_api_gateway_resource" "authorize" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "authorize"
}

module "authorize_route" {
  source          = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.authorize.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "GET"
  authorizer_id   = module.jwt_authorizer.authorizer_id
  integration_uri = module.lambda.invoke_arn
}

resource "aws_api_gateway_resource" "callback" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "auth"
}

resource "aws_api_gateway_resource" "callback_app" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_resource.callback.id
  path_part   = "{appKey}"
}

module "auth_callback_route" {
  source          = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.callback_app.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "GET"
  integration_uri = module.lambda.invoke_arn
}

resource "aws_api_gateway_resource" "validate" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "validate"
}

module "validate_route" {
  source          = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.validate.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "POST"
  authorizer_id   = module.jwt_authorizer.authorizer_id
  integration_uri = module.lambda.invoke_arn
}

resource "aws_api_gateway_resource" "cleanup" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "cleanup"
}

module "cleanup_route" {
  source          = "git::https://gitlab.domain.com/team/BU/terraform/api-gateway-route.git?ref=5.0.0"
  rest_api_id     = aws_api_gateway_rest_api.apigw.id
  resource_id     = aws_api_gateway_resource.cleanup.id
  stage_name      = aws_api_gateway_stage.apigw_stage.stage_name
  http_method     = "POST"
  authorizer_id   = module.jwt_authorizer.authorizer_id
  integration_uri = module.lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "apigw_deployment" {
  rest_api_id       = aws_api_gateway_rest_api.apigw.id
  stage_description = "Deployed at: ${timestamp()}"

  lifecycle {
    create_before_destroy = true
  }
}
