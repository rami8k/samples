data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_lambda_function" "interactions_lambda" {
  function_name    = "${var.application_name}-interactions-handler"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "newrelic_lambda_wrapper.handler"
  runtime          = "python3.8"
  timeout          = 900
  filename         = "interactions-lambda.zip"
  source_code_hash = filebase64sha256("interactions-lambda.zip")
  tracing_config {
    mode = "Active"
  }
  environment {
    variables = {
      PERSONALIZE_SOLUTION_ARN               = var.personalize_solution_arn
      NEW_RELIC_LAMBDA_HANDLER               = "main.handler"
      NEW_RELIC_ACCOUNT_ID                   = var.newrelic_account_id
      NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS = true
      NEW_RELIC_EXTENSION_LOG_LEVEL          = "DEBUG"
    }
  }
  layers = ["arn:aws:lambda:${data.aws_region.current.name}:451483290750:layer:NewRelicPython38:37"]
  tags   = var.tags
}

resource "aws_cloudwatch_log_group" "interactions_lambda_log_group" {
  name              = "/aws/lambda/${var.application_name}-interactions-handler"
  retention_in_days = 7
}

resource "aws_lambda_function" "recommendations_lambda" {
  function_name    = "${var.application_name}-recommendations-handler"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "newrelic_lambda_wrapper.handler"
  runtime          = "python3.8"
  timeout          = 900
  filename         = "recommendations-lambda.zip"
  source_code_hash = filebase64sha256("recommendations-lambda.zip")
  tracing_config {
    mode = "Active"
  }
  environment {
    variables = {
      PERSONALIZE_SOLUTION_ARN               = var.personalize_solution_arn
      PERSONALIZE_DATASET_GROUP_ARN          = var.personalize_dataset_group_arn
      NEW_RELIC_LAMBDA_HANDLER               = "main.handler"
      NEW_RELIC_ACCOUNT_ID                   = var.newrelic_account_id
      NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS = true
      NEW_RELIC_EXTENSION_LOG_LEVEL          = "DEBUG"
    }
  }
  layers = ["arn:aws:lambda:${data.aws_region.current.name}:451483290750:layer:NewRelicPython38:37"]
  tags   = var.tags
}

resource "aws_cloudwatch_log_group" "recommendations_lambda_log_group" {
  name              = "/aws/lambda/${var.application_name}-recommendations-handler"
  retention_in_days = 7
}

resource "aws_api_gateway_rest_api" "apigw" {
  name = var.application_name
  endpoint_configuration {
    types = ["EDGE"]
  }
  tags = var.tags
}

module "jwt_authorizer_lambda" {
  source            = "./authorizer"
  target_account_id = var.target_account_id
  tags              = var.tags
}

module "jwt_authorizer" {
  source            = "git::https:///api-gateway-authorizer.git"
  name              = "${var.application_name}-jwt-authorizer"
  apigw_id          = aws_api_gateway_rest_api.apigw.id
  lambda_arn        = module.jwt_authorizer_lambda.lambda_arn
  lambda_invoke_arn = module.jwt_authorizer_lambda.lambda_invoke_arn
  tags              = var.tags
}

module "recommendations_route" {
  source           = "git::https:///api-gateway-route.git"
  apigw_id         = aws_api_gateway_rest_api.apigw.id
  root_resource_id = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part        = "recommendations"
  http_method      = "GET"
  authorize        = false
  # authorizer_id = module.authorizer.authorizer_id
  invoke_arn = aws_lambda_function.recommendations_lambda.invoke_arn
  tags       = var.tags
}

module "interactions_route" {
  source           = "git::https:///terraform/api-gateway-route.git"
  apigw_id         = aws_api_gateway_rest_api.apigw.id
  root_resource_id = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part        = "interaction"
  http_method      = "POST"
  authorize        = false
  # authorizer_id = module.authorizer.authorizer_id
  invoke_arn = aws_lambda_function.interactions_lambda.invoke_arn
  tags       = var.tags
}

resource "aws_api_gateway_stage" "apigw_stage" {
  stage_name    = "prod"
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  deployment_id = aws_api_gateway_deployment.apigw_deployment.id
  tags          = var.tags
}

resource "aws_api_gateway_deployment" "apigw_deployment" {
  rest_api_id       = aws_api_gateway_rest_api.apigw.id
  stage_description = "Deployed at: ${timestamp()}"

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    module.recommendations_route,
    module.interactions_route
  ]
}

locals {
  allowed_hosts = [format("%s.execute-api.%s.amazonaws.com", aws_api_gateway_rest_api.apigw.id, data.aws_region.current.name)]
}

module "waf" {
  source            = "./waf"
  name              = var.application_name
  target_account_id = var.target_account_id
  allowed_hosts     = local.allowed_hosts
  tags              = var.tags
}

resource "aws_wafv2_web_acl_association" "acl_association" {
  resource_arn = aws_api_gateway_stage.apigw_stage.arn
  web_acl_arn  = module.waf.waf_acl_arn
}

resource "aws_lambda_permission" "interactions_lambda_role" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.interactions_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_permission" "recommendations_lambda_role" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recommendations_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}

resource "aws_iam_role" "lambda_execution_role" {
  path               = "/"
  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": [
            "lambda.amazonaws.com",
            "apigateway.amazonaws.com"
          ]
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  EOF

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "newrelic_read_license_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::${var.target_account_id}:policy/NewRelic-ViewLicenseKey"
}

resource "aws_iam_role_policy" "lambda_execution_role_policy" {
  role   = aws_iam_role.lambda_execution_role.id
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "personalize:DescribeSolution",
          "personalize:ListCampaigns",
          "personalize:ListFilters",
          "personalize:DescribeEventTracker",
          "personalize:ListEventTrackers",
          "personalize:GetRecommendations",
          "personalize:PutEvents"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "dynamodb:Scan"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/recommendations*"
      },
      {
        "Action": [
          "firehose:PutRecord"
        ],
        "Effect": "Allow",
        "Resource": "*"
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_role" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
