resource "aws_lambda_function" "authorizer" {
  function_name    = "${var.application_name}-api-authorizer"
  filename         = "api-authorizer-lambda.zip"
  handler          = "main.handler"
  runtime          = "python3.8"
  role             = aws_iam_role.lambda_execution_role.arn
  source_code_hash = filebase64sha256("api-authorizer-lambda.zip")
  tags             = var.tags
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${var.application_name}-api-authorizer"
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
          "arn:aws:ssm:us-east-1:${var.target_account_id}:parameter/*",
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
