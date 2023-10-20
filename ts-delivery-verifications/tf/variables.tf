variable "env" {
  type    = string
  default = "dev"
}

variable "target_account_id" { type = string }

variable "target_role_name" {
  description = "Name of the role for configurations"
  type        = string
  default     = "inf-gitlab-terraform-deployment"
}

variable "domain_name" { type = string }
variable "newrelic_app_name" { type = string }
variable "newrelic_account_id" { type = string }
variable "auth_callback_url" { type = string }

variable "tags" {
  type = map(string)
  default = {
    "appCode"      = "BU-edv"
    "businessUnit" = "BU"
  }
}
