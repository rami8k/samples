data "aws_region" "current" {}

resource "aws_lambda_function" "bwrite_job_lambda" {
  function_name    = "${var.application_name}-items-pull-job"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "newrelic_lambda_wrapper.handler"
  runtime          = "python3.8"
  memory_size      = 256
  timeout          = 900
  filename         = "bwrite-lambda.zip"
  source_code_hash = filebase64sha256("bwrite-lambda.zip")

  environment {
    variables = {
      APP_ENV                                = "production"
      BWRITE_URL                             = var.bwrite_url
      PERSONALIZE_SOLUTION_ARN               = var.personalize_solution_arn
      PERSONALIZE_ITEMS_DATASET_ARN          = var.personalize_items_dataset_arn
      NEW_RELIC_LAMBDA_HANDLER               = "main.handler"
      NEW_RELIC_ACCOUNT_ID                   = var.newrelic_account_id
      NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS = true
      NEW_RELIC_EXTENSION_LOG_LEVEL          = "DEBUG"
    }
  }
  layers = ["arn:aws:lambda:${data.aws_region.current.name}:451483290750:layer:NewRelicPython38:37"]
  tags   = var.tags
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${var.application_name}-items-pull-job"
  retention_in_days = 7
}

resource "aws_iam_role" "lambda_execution_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "newrelic_read_license_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::${var.target_account_id}:policy/NewRelic-ViewLicenseKey"
}

resource "aws_iam_role_policy" "lambda_execution_role_policy" {
  role = aws_iam_role.lambda_execution_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:us-east-1:${var.target_account_id}:table/recommendations*"
      },
      {
        "Action": [
          "personalize:PutEvents",
          "personalize:DescribeSolution",
          "personalize:ListEventTrackers",
          "personalize:DescribeEventTracker",
          "personalize:DescribeDataset",
          "personalize:DescribeSchema",
          "personalize:PutItems"
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

resource "aws_cloudwatch_event_rule" "bwrite_job_lambda_schedule" {
  name                = "${var.application_name}-items-pull-job-schedule"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "bwrite_job_lambda_schedule_target" {
  rule      = aws_cloudwatch_event_rule.bwrite_job_lambda_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.bwrite_job_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_lambda_role" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bwrite_job_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.bwrite_job_lambda_schedule.arn
}
