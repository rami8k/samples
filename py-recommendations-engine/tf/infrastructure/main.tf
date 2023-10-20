data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "recommendations_bucket" {
  bucket = var.bucket_name
  acl    = "private"

  logging {
    target_bucket = "${var.s3_logging_bucket_name}-${data.aws_region.current.name}-${data.aws_caller_identity.current.account_id}"
    target_prefix = "${var.bucket_name}-bucket/"
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule {
    id      = "30 days"
    enabled = true

    expiration {
      days = 30
    }
  }

  tags = var.tags
}

resource "aws_s3_bucket_policy" "recommendations_bucket_policy" {
  bucket = aws_s3_bucket.recommendations_bucket.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "personalize.amazonaws.com"
      },
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "${aws_s3_bucket.recommendations_bucket.arn}",
        "${aws_s3_bucket.recommendations_bucket.arn}/*"
      ]
    },
    {
      "Sid": "denyHttp",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "${aws_s3_bucket.recommendations_bucket.arn}/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
POLICY
}

resource "aws_iam_role" "alerts_lambda_role" {
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

resource "aws_iam_role_policy" "alerts_lambda_role_policy" {
  role = aws_iam_role.alerts_lambda_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "ssm:GetParameter"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:ssm:*:*:*"
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "alerts_lambda_basic_execution_role" {
  role       = aws_iam_role.alerts_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "alerts_lambda" {
  role             = aws_iam_role.alerts_lambda_role.arn
  filename         = "alerts-lambda.zip"
  handler          = "main.handler"
  runtime          = "python3.8"
  function_name    = "${var.application_name}-alerts"
  source_code_hash = filebase64sha256("alerts-lambda.zip")

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "alerts_lambda_log_group" {
  name              = "/aws/lambda/${var.application_name}-alerts-handler"
  retention_in_days = 7
}
