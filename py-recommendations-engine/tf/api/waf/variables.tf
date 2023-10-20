variable "name" { type = string }
variable "target_account_id" { type = string }
variable "allowed_hosts" { type = list(string) }
variable "tags" { type = map(string) }