resource "aws_ecs_cluster" "recommendations_cluster" {
  name = "${var.application_name}-ecs-cluster"
  tags = var.tags
}

resource "aws_iam_role" "eks_cluster_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "eks_cluster_role_attachement" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.application_name}-ecs-tasks"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "ecs-tasks.amazonaws.com",
          "personalize.amazonaws.com",
          "lambda.amazonaws.com"
        ]
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_AWSLakeFormationDataAdmin" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSLakeFormationDataAdmin"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_AWSGlueConsoleFullAccess" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSGlueConsoleFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_CloudWatchLogsReadOnlyAccess" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsReadOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_AmazonAthenaFullAccess" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonAthenaFullAccess"
}

resource "aws_iam_role_policy" "ecs_task_execution_policy" {
  role = aws_iam_role.ecs_task_execution_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "iam:PassRole"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "personalize:ListSolutions",
          "personalize:ListRecipes",
          "personalize:CreateSolution",
          "personalize:ListCampaigns",
          "personalize:ListDatasetGroups",
          "personalize:ListDatasets",
          "personalize:ListEventTrackers",
          "personalize:ListFilters",
          "personalize:DescribeSolution",
          "personalize:CreateSolutionVersion",
          "personalize:DescribeSolutionVersion",
          "personalize:CreateSchema",
          "personalize:DescribeSchema",
          "personalize:CreateDatasetGroup",
          "personalize:DescribeDatasetGroup",
          "personalize:CreateDataset",
          "personalize:DescribeDataset",
          "personalize:CreateDatasetImportJob",
          "personalize:DescribeDatasetImportJob",
          "personalize:DescribeCampaign",
          "personalize:CreateCampaign",
          "personalize:CreateEventTracker",
          "personalize:CreateFilter",
          "personalize:DeleteDatasetGroup",
          "personalize:DeleteDataset",
          "personalize:DeleteSolution",
          "personalize:DeleteCampaign",
          "personalize:DeleteFilter",
          "personalize:DeleteEventTracker"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "s3:ListBucket",
          "s3:PutObject",
          "s3:GetObject",
          "s3:AbortMultipartUpload",
          "s3:ListMultipartUploadParts",
          "s3:GetBucketLocation",
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "athena:GetDataCatalog",
          "athena:GetQueryExecution",
          "athena:GetQueryResults",
          "athena:ListQueryExecutions",
          "athena:StartQueryExecution"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Action": [
          "glue:BatchGetPartition",
          "glue:GetDatabase",
          "glue:GetDatabases",
          "glue:GetPartition",
          "glue:GetPartitions",
          "glue:GetTable",
          "glue:GetTables"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
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
          "lambda:InvokeFunction"
        ],
        "Effect": "Allow",
        "Resource": "*"
      }
    ]
  }
  EOF
}

resource "aws_iam_role" "ecs_event_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "ecs.amazonaws.com",
          "ecs-tasks.amazonaws.com"
        ]
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs_event_role_AmazonEC2ContainerServiceEventsRole" {
  role       = aws_iam_role.ecs_event_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole"
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

resource "aws_iam_role_policy_attachment" "personalize_execution_AmazonPersonalizeFullAccess" {
  role       = aws_iam_role.personalize_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonPersonalizeFullAccess"
}

resource "aws_iam_role_policy_attachment" "personalize_execution_AmazonS3FullAccess" {
  role       = aws_iam_role.personalize_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy" "personalize_execution_role_s3_policy" {
  role = aws_iam_role.ecs_event_role.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        "Effect": "Allow",
        "Resource": "*"
      }
    ]
  }
  EOF
}

resource "aws_security_group" "ec2_security_group" {
  name   = "${var.application_name}-tasks"
  vpc_id = var.vpc

  egress {
    description = "allow all outgoing traffic"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_tls"
  }
}

resource "aws_cloudwatch_log_group" "populate_db_log_group" {
  name              = "${var.application_name}-populate-database"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "populate_db_task" {
  family                   = "${var.application_name}-populate-db"
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "populate-database",
    "image": "${var.image}",
    "command": [ "populate_db.py" ],
    "cpu": 10,
    "memory": 8192,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${var.application_name}-populate-database",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "populate-database",
        "awslogs-create-group": "true"
      }
    },
    "environment": [
      {
        "name": "PULL_DATE",
        "value": ""
      },
      {
        "name": "BUCKET_NAME",
        "value": "${var.bucket_name}"
      },
      {
        "name": "BWRITE_URL",
        "value": "${var.bwrite_url}"
      }
    ]
  }
]
TASK_DEFINITION
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "8192"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "populate_recent_items_log_group" {
  name              = "${var.application_name}-populate-recent-items"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "populate_recent_items_task" {
  family                   = "${var.application_name}-populate-recent-items"
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "populate-recent-items",
    "image": "${var.image}",
    "command": [ "populate_recent_items.py" ],
    "cpu": 10,
    "memory": 8192,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${var.application_name}-populate-recent-items",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "populate-database",
        "awslogs-create-group": "true"
      }
    },
    "environment": [
      {
        "name": "BUCKET_NAME",
        "value": "${var.bucket_name}"
      },
      {
        "name": "BWRITE_URL",
        "value": "${var.bwrite_url}"
      }
    ]
  }
]
TASK_DEFINITION
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "8192"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "prepaire_data_files_log_group" {
  name              = "${var.application_name}-prepaire-data"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "prepaire_data_files_task" {
  family                   = "${var.application_name}-prepaire-data-files"
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "prepaire-data-files",
    "image": "${var.image}",
    "command": [ "prepaire_data.py" ],
    "cpu": 10,
    "memory": 8192,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${var.application_name}-prepaire-data",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "prepaire-data",
        "awslogs-create-group": "true"
      }
    },
    "environment": [
      {
        "name": "BUCKET_NAME",
        "value": "${var.bucket_name}"
      },
      {
        "name": "INITIAL_SOLUTION_DATA_FOLDER",
        "value": "${var.initial_solution_data_folder}"
      }
    ]
  }
]
TASK_DEFINITION
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "8192"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "create_solution_task_log_group" {
  name              = "${var.application_name}-create-solution"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "create_solution_task" {
  family                   = "${var.application_name}-create-solution"
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "create-solution",
    "image": "${var.image}",
    "command": [ "create_solution.py" ],
    "cpu": 10,
    "memory": 8192,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${var.application_name}-create-solution",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "create-solution",
        "awslogs-create-group": "true"
      }
    },
    "environment": [
      {
        "name": "BUCKET_NAME",
        "value": "${var.bucket_name}"
      },
      {
        "name": "PERSONALIZE_ROLE",
        "value": "${aws_iam_role.personalize_execution_role.arn}"
      },
      {
        "name": "SOLUTION_NAME",
        "value": "${var.personalize_solution_name}"
      },
      {
        "name": "INITIAL_SOLUTION_DATA_FOLDER",
        "value": "${var.initial_solution_data_folder}"
      }
    ]
  }
]
TASK_DEFINITION
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "8192"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "delete_solution_task_log_group" {
  name              = "${var.application_name}-delete-solution"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "delete_solution_task" {
  family                   = "${var.application_name}-delete-solution"
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "delete-solution",
    "image": "${var.image}",
    "command": [ "delete_solution.py" ],
    "cpu": 10,
    "memory": 8192,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${var.application_name}-delete-solution",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "delete-solution",
        "awslogs-create-group": "true"
      }
    },
    "environment": [
      {
        "name": "PERSONALIZE_SOLUTION_ARN",
        "value": "${var.personalize_solution_arn}"
      },
      {
        "name": "PERSONALIZE_DATASET_GROUP_ARN",
        "value": "${var.personalize_dataset_group_arn}"
      }
    ]
  }
]
TASK_DEFINITION
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "8192"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "other_tasks_log_group" {
  name              = "${var.application_name}-personalize-tasks"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "other_tasks" {
  family                   = "${var.application_name}-other-tasks"
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "other-tasks",
    "image": "${var.image}",
    "command": [ "personalize_tasks.py" ],
    "cpu": 10,
    "memory": 8192,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${var.application_name}-personalize-tasks",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "personalize-tasks",
        "awslogs-create-group": "true"
      }
    },
    "environment": [
      {
        "name": "TASK_NAME",
        "value": ""
      },
      {
        "name": "ARGS",
        "value": "arg1=val1|arg2=val2"
      },
      {
        "name": "PERSONALIZE_SOLUTION_ARN",
        "value": "${var.personalize_solution_arn}"
      },
      {
        "name": "PERSONALIZE_DATASET_GROUP_ARN",
        "value": "${var.personalize_dataset_group_arn}"
      },
      {
        "name": "PERSONALIZE_ROLE",
        "value": "${aws_iam_role.personalize_execution_role.arn}"
      },
      {
        "name": "INITIAL_SOLUTION_DATA_FOLDER",
        "value": "${var.initial_solution_data_folder}"
      }
    ]
  }
]
TASK_DEFINITION
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "8192"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  tags = var.tags
}
