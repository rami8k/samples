data "aws_region" "current" {}

resource "aws_lambda_function" "training_lambda" {
  function_name    = "${var.application_name}-training-lambda"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "newrelic_lambda_wrapper.handler"
  runtime          = "python3.8"
  timeout          = 900
  filename         = "training-lambda.zip"
  source_code_hash = filebase64sha256("training-lambda.zip")

  environment {
    variables = {
      NEW_RELIC_LAMBDA_HANDLER               = "main.handler"
      NEW_RELIC_ACCOUNT_ID                   = var.newrelic_account_id
      NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS = true
      NEW_RELIC_EXTENSION_LOG_LEVEL          = "DEBUG"
    }
  }
  layers = ["arn:aws:lambda:${data.aws_region.current.name}:451483290750:layer:NewRelicPython38:37"]

  tags = var.tags
}

resource "aws_iam_role" "personalize_execution_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "personalize.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "personalize_execution_role_policy" {
  role       = aws_iam_role.personalize_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonPersonalizeFullAccess"
}

resource "aws_iam_role" "lambda_execution_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "personalize.amazonaws.com"
        ]
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "lambda_execution_role_policy" {
  role = aws_iam_role.lambda_execution_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "iam:PassRole"
        ],
        "Effect": "Allow",
        "Resource": "${aws_iam_role.personalize_execution_role.arn}"
      },
      {
        "Action": [
          "personalize:CreateSolution",
          "personalize:DescribeSolution",
          "personalize:CreateSolutionVersion",
          "personalize:DescribeSolutionVersion",
          "personalize:GetRecommendations",
          "personalize:DescribeDataset",
          "personalize:DescribeDatasetImportJob",
          "personalize:DescribeSchema",
          "personalize:CreateDatasetImportJob",
          "personalize:DescribeCampaign",
          "personalize:ListCampaigns",
          "personalize:CreateCampaign",
          "personalize:DeleteCampaign",
          "personalize:PutEvents"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "s3:PutObject",
          "s3:GetObject"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:s3:::${var.bucket_name}",
          "arn:aws:s3:::${var.bucket_name}/*"
        ]
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_role" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "newrelic_read_license_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::${var.target_account_id}:policy/NewRelic-ViewLicenseKey"
}

resource "aws_iam_role" "state_machine_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "state_machine_role_policy" {
  role   = aws_iam_role.state_machine_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "states:ListStateMachines",
        "states:StartExecution"
      ],
      "Effect": "Allow",
      "Resource": "${aws_sfn_state_machine.full_training.arn}"
    }
  ]
}
EOF
}

resource "aws_iam_role" "state_machine_lambda_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "states.us-east-1.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "state_machine_lambda_role_policy" {
  role   = aws_iam_role.state_machine_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "lambda:InvokeFunction",
      "Effect": "Allow",
      "Resource": "${aws_lambda_function.training_lambda.arn}"
    }
  ]
}
EOF
}

resource "aws_sfn_state_machine" "full_training" {
  name     = "${var.application_name}-full-training"
  role_arn = aws_iam_role.state_machine_lambda_role.arn

  definition = <<EOF
{
  "Comment": "AWS Step Functions Example",
  "StartAt": "CreateSolutionVersion",
  "Version": "1.0",
  "States": {
    "CreateSolutionVersion": {
      "Type": "Task",
      "Resource": "${aws_lambda_function.training_lambda.arn}", 
      "Parameters": {
        "TASK_NAME": "create_solution_version",
        "PERSONALIZE_SOLUTION_ARN": "${var.personalize_solution_arn}"
      },
      "Next": "WaitSolutionVersion"
    },
    "WaitSolutionVersion": {
      "Type": "Task",
      "Resource": "${aws_lambda_function.training_lambda.arn}",
      "Parameters": {
        "TASK_NAME": "wait_solution_version",
        "solution_version_arn.$": "$.solution_version_arn"
      },
      "Next": "CheckSolutionVersionStatus"
    },
    "CheckSolutionVersionStatus": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.status",
          "StringEquals": "CREATE IN_PROGRESS",
          "Next": "WaitSolutionVersion"
        },
        {
          "Variable": "$.status",
          "StringEquals": "CREATE FAILED",
          "Next": "FailState"
        },
        {
          "Variable": "$.status",
          "StringEquals": "ACTIVE",
          "Next": "CreateCampaign"
        }
      ],
      "Default": "NoMatchState"
    },
    "CreateCampaign": {
      "Type": "Task",
      "Resource": "${aws_lambda_function.training_lambda.arn}",
      "Parameters": {
        "TASK_NAME": "create_campaign",
        "solution_version_arn.$": "$.solution_version_arn"
      },
      "Next": "WaitCampaign"
    },
    "WaitCampaign": {
      "Type": "Task",
      "Resource": "${aws_lambda_function.training_lambda.arn}",
      "Parameters": {
        "TASK_NAME": "wait_campaign",
        "campaign_arn.$": "$.campaign_arn"
      },
      "Next": "CheckCampaignStatus"
    },
    "CheckCampaignStatus": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.status",
          "StringEquals": "CREATE IN_PROGRESS",
          "Next": "WaitCampaign"
        },
        {
          "Variable": "$.status",
          "StringEquals": "CREATE FAILED",
          "Next": "FailState"
        },
        {
          "Variable": "$.status",
          "StringEquals": "ACTIVE",
          "Next": "DeleteOldCampaigns"
        }
      ],
      "Default": "NoMatchState"
    },
    "DeleteOldCampaigns": {
      "Type": "Task",
      "Resource": "${aws_lambda_function.training_lambda.arn}",
      "Parameters": {
        "TASK_NAME": "delete_old_campaigns",
        "PERSONALIZE_SOLUTION_ARN": "${var.personalize_solution_arn}",
        "campaign_arn.$": "$.campaign_arn"
      },
      "Next": "SuccessState"
    },
    "NoMatchState": {
      "Type": "Fail",
      "Cause": "No Matches!"
    },
    "FailState": {
      "Type": "Fail",
      "Cause": "Error Occured!"
    },
    "SuccessState": {
      "Type": "Succeed"
    }
  }
}
EOF

  tags = var.tags
}

resource "aws_cloudwatch_event_rule" "daily_training_schedule" {
  name                = "${var.application_name}-daily-training-schedule"
  schedule_expression = "cron(0 8 ? * MON-FRI *)"
  is_enabled          = true
}

resource "aws_cloudwatch_event_target" "daily_training_schedule_target" {
  rule      = aws_cloudwatch_event_rule.daily_training_schedule.name
  target_id = "${var.application_name}-training-step-function"
  arn       = aws_sfn_state_machine.full_training.arn
  role_arn  = aws_iam_role.state_machine_role.arn
}
