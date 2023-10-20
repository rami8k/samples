variable "target_account_id" { type = string }
variable "bucket_name" { type = string }
variable "s3_logging_bucket_name" { type = string }
variable "daily_billing_threshold" { type = string }
variable "alerts_email" { type = string }
variable "tags" { type = map(string) }