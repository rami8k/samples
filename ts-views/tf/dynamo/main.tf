terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

data "aws_region" "curre
nt" {}

resource "aws_dynamodb_table" "app_user_history_table" {
  name         = "app.UserHistory"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"
  range_key    = "ViewDate"

  attribute {
    name = "UserId"
    type = "N"
  }

  attribute {
    name = "ViewDate"
    type = "N"
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  stream_enabled = true

  stream_view_type = "NEW_IMAGE"

  replica {
    region_name = var.replica_region
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "app_article_views_table" {
  name         = "app.ArticleViewsPerMin"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "Id"

  attribute {
    name = "Id"
    type = "S"
  }

  attribute {
    name = "ChannelId"
    type = "S"
  }

  attribute {
    name = "TTL"
    type = "N"
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  global_secondary_index {
    name               = "Channel-Index"
    hash_key           = "ChannelId"
    range_key          = "TTL"
    projection_type    = "INCLUDE"
    non_key_attributes = ["ArticleId", "Count"]
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  replica {
    region_name = var.replica_region
  }

  tags = var.tags
}

module "vpc" {
  source = "git::https://gitlab.domain.com/team/app/terraform/vpc.git?ref=2.0.0"
  env    = var.env
}

resource "aws_lambda_function" "views_stream_handler" {
  function_name    = "app-views-stream-handler"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "newrelic-lambda-wrapper.handler"
  runtime          = "nodejs12.x"
  timeout          = 60
  filename         = "../stream-handler-lambda.zip"
  source_code_hash = filebase64sha256("../stream-handler-lambda.zip")
  environment {
    variables = {
      BWRITE_URL                             = var.bwrite_url
      NEW_RELIC_LAMBDA_HANDLER               = "index.handler"
      NEW_RELIC_ACCOUNT_ID                   = var.newrelic_account_id
      NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS = true
      NEW_RELIC_EXTENSION_LOG_LEVEL          = "DEBUG"
    }
  }
  layers = ["arn:aws:lambda:${data.aws_region.current.name}:451483290750:layer:NewRelicNodeJS12X:41"]
  vpc_config {
    subnet_ids         = module.vpc.vpc_config.subnet_ids
    security_group_ids = module.vpc.vpc_config.security_group_ids
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "views_stream_handler_log_group" {
  name              = "/aws/lambda/app-views-stream-handler"
  retention_in_days = 7
  tags              = var.tags
}

resource "aws_lambda_event_source_mapping" "views_stream_handler_mapping" {
  event_source_arn  = aws_dynamodb_table.app_user_history_table.stream_arn
  function_name     = aws_lambda_function.views_stream_handler.arn
  starting_position = "LATEST"
}

resource "aws_iam_role" "lambda_execution_role" {
  path        = "/"
  description = "Allows Lambda Function to call AWS services on your behalf."

  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }
  EOF

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_role" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access_role" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "newrelic_read_license_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::${var.target_account_id}:policy/NewRelic-ViewLicenseKey"
}

resource "aws_iam_role_policy" "db_lambda_push_policy" {
  role = aws_iam_role.lambda_execution_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "logs:PutLogEvents"
        ],
        "Effect": "Allow",
        "Resource": "*"
      }
    ]
  }
  EOF
}
