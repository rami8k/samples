variable "target_account_id" { type = string }
variable "notification_topics" { type = list(any) }
variable "bwrite_url" { type = string }
variable "application_name" { type = string }
variable "personalize_solution_arn" { type = string }
variable "personalize_items_dataset_arn" { type = string }
variable "newrelic_account_id" { type = string }
variable "tags" { type = map(string) }
