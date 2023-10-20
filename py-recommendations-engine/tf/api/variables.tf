variable "env" { type = string }
variable "target_account_id" { type = string }
variable "personalize_solution_arn" { type = string }
variable "personalize_dataset_group_arn" { type = string }
variable "notification_topics" { type = list }
variable "newrelic_account_id" { type = string }
variable "tags" { type = map(string) }