resource "aws_lambda_function" "authorizer" {
  function_name    = "BU-edv-pass-authorizer"
  handler          = "index.handler"
  runtime          = "nodejs14.x"
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = "../pass-authorizer-lambda.zip"
  source_code_hash = filebase64sha256("../pass-authorizer-lambda.zip")
  tracing_config {
    mode = "Active"
  }
  tags = var.tags
}

resource "aws_cloudwatch_log_group" "authorizer_lambda_log_group" {
  name              = "/aws/lambda/BU-edv-pass-authorizer"
  retention_in_days = 14
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
          "apigateway.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
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
          "ssm:GetParameter"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:ssm:us-east-1:${var.target_account_id}:parameter/BU*",
          "arn:aws:ssm:us-east-1:${var.target_account_id}:parameter/team*"
        ]
      },
      {
        "Action": [
          "logs:PutLogEvents"
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
      }
    ]
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_role" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
