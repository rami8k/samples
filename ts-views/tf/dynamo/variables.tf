variable "env" { type = string }
variable "target_account_id" { type = string }
variable "replica_region" { type = string }
variable "bwrite_url" { type = string }
variable "newrelic_account_id" { type = string }
variable "tags" { type = map(string) }
variable "vpc_id" { type = string }
variable "vpc_private_subnets" { type = list(string) }
