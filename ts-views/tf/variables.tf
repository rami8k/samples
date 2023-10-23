variable "env" {
  type    = string
  default = "dev"
}

variable "application_name" {
  type    = string
  default = "app-views"
}

variable "target_account_id" {
  type = string
}

variable "target_role_name" {
  description = "Name of the role for configurations"
  type        = string
  default     = "inf-gitlab-terraform-deployment"
}

variable "domain" {
  type = string
}

variable "newrelic_app_name" {
  type = string
}

variable "bwrite_url" {
  type = string
}

variable "newrelic_account_id" {
  type = string
}

variable "notification_topics_east" {
  type = list(any)
}

variable "notification_topics_west" {
  type = list(any)
}

variable "vpc_id_east" {
  type = string
}

variable "vpc_id_west" {
  type = string
}

variable "vpc_private_subnets_east" {
  type = list(string)
}

variable "vpc_private_subnets_west" {
  type = list(string)
}

variable "tags" {
  type = map(string)
  default = {
    "appCode"         = "app-views"
    "businessUnit"    = "app"
    "confidentiality" = "limitedAccess"
    "migrated"        = "False"
    "owner:appCode"   = "app-views"
    "owner:business"  = "sn121993"
    "owner:technical" = "rk8343"
  }
}
