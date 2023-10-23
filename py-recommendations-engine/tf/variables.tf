variable "env" { type = string }
variable "domain_name" { type = string }
variable "vpc" { type = string }
variable "personalize_solution_name" { type = string }
variable "personalize_dataset_group_name" { type = string }
variable "bucket_name" { type = string }
variable "s3_logging_bucket_name" { type = string }
variable "initial_solution_data_folder" { type = string }
variable "s3_app_folder" { type = string }
variable "daily_billing_threshold" { type = string }
variable "alerts_email" { type = string }
variable "bwrite_url" { type = string }
variable "notification_topics" { type = list(any) }
variable "andes_glue_data_catalog_account_id" { type = string }
variable "target_account_id" { type = string }
variable "newrelic_account_id" { type = string }
variable "certificate_arn_east" { type = string }
variable "certificate_arn_west" { type = string }

variable "target_role_name" {
  description = "Name of the role for configurations"
  type        = string
  default     = "inf-gitlab-terraform-deployment"
}

variable "team_name" {
  type    = string
  default = "your_team_name" //todo: make sure it matches the TEAM_NAME in gitlab-ci, ex:
}

variable "application_name" {
  type    = string
  default = "your_application_name" //todo: make sure it matches the APPLICATION_NAME in gitlab-ci, ex: recommendations
}

variable "tags" {
  type = map(string)
  default = {
    businessUnit      = "BU"
    confidentiality   = "limitedAccess"
    migrated          = "False"
    "owner:business"  = "xx1234"
    "owner:technical" = "xy1234"
  }
}
