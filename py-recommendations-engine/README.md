# Recommendations (AWS Personalize)

### Overview

A generic template repo to create a recommendations service based on AWS Personalize.

## Stack:

* Monorepo 
* Python3, Pandas, Numpy
* Terraform
* CI/CD in gitlab

## AWS Infrastructure:

* Docker + Fargate
* S3 buckets
* databases (DynamoDB)
* Lambdas, API gateway
* Route53 domain setup
* Certificate
* IAM roles and policies
* AWS Personalize solution data imports and training
* Step Functions for training

All AWS intrastructure is managed by Terraform and CI/CD managed by gitlab-ci

License
----

