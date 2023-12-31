# Porfolio Sample Projects

## js-compliance-tool

GDPR compliance tracker and dashboard.

Stack:

* Node
* GraphQl Server
* VUE Frontend
* Jest
* ESLint
* Webpack

## py-recommendations-engine

A recommendations engine based on AWS Personalize

Stack:

* Monorepo 
* Python3, Pandas, Numpy
* Terraform
* CI/CD in gitlab

AWS Infrastructure:

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

## ts-delivery-verifications

Email Delivery Verification

One stop shop to verify your emails/newsletters are delivered to your mailbox after the your delivery task has been triggered.

Stack:
* TypeScript
* Monorepo using Lerna 
* Terraform
* CI/CD in gitlab

## ts-views

Views

Application service to count article visits based on DynamoDB for low cost implementation.

Stack:
* TypeScript
* Monorepo using Lerna 
* Terraform + AWS
* CI/CD in gitlab