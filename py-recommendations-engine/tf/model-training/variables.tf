variable "target_account_id" { type = string }
variable "notification_topics" { type = list }
variable "bucket_name" { type = string }
variable "s3_app_folder" { type = string }
variable "personalize_solution_arn" { type = string }
variable "newrelic_account_id" { type = string }
variable "tags" { type = map(string) }