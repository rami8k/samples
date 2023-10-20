# tasks

### Overview

All the tasks required to initialize and train a new solution from scratch.

## populate_db

Populates DynamoDb tables from the API datasource.

## prepaire_data

Creates CSV files to be imported in AWS Personalize datasets for initial solution training.

## create_solution

Create and train a solution with all its resources (datasets, schemas, campain, filters ... etc).

Require the database to be pre-populated and CSV files pre-generated.

## delete_solution

Delete entire solution with all its resources.
Doesn't delete the database or infrastructure.

## personalize_tasks

Generic list of tasks, can be used to create AWS Personalize resources in production account.

| Task                    | Parameters                                    | Description |
| -------------           | -----------                                   |------------|
| create_filter           |arg1: filter_name, arg2: filter_value          | creates a filter |
| delete_filter           |arg1: filter_arn                               | S3 Bucket, roles and policies for Personalize training permissions |
| delete_solition         |arg1: solution_arn                             | dynbamoDb to hold items for training pipeline and recent items for recommendations api |
| create_solution         |arg1: solution_name                            | scheduled job to pull latest items from bwrite |
| create_solution_version |arg1: solution_arn, arg2: mode                 | scheduled job to import items into Personalize Items Dataset |
| delete_campaign         |arg1: campaign_arn                             | news recommendations and interactions APIs infrastructure |
| create_campaign         |arg1: campaign_name, arg2: solution_version_arn| scheduled job to traing personalize solution |
