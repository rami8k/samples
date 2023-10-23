variable "env" { type = string }
variable "target_account_id" { type = string }
variable "domain" { type = string }
variable "zone_id" { type = string }
variable "tags" { type = map(string) }
variable "newrelic_account_id" { type = string }
variable "notification_topics" { type = list(any) }
