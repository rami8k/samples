env                                = "prd"
target_account_id                  = "1234"
vpc                                = "vpc-1234"
domain_name                        = "recommendations.domain.com"
bucket_name                        = "recommendations"
s3_logging_bucket_name             = "s3-access-logging"
s3_app_folder                      = "app-data/recommendations"
personalize_solution_name          = "recommendations-v3"
personalize_dataset_group_name     = "recommendations-v3"
andes_glue_data_catalog_account_id = "12345"
bwrite_url                         = ""
daily_billing_threshold            = 25
alerts_email                       = "alerts@domain.com"
initial_solution_data_folder       = "initial-solution-data"
newrelic_account_id                = "12345"
notification_topics = [
  "arn:aws:sns:us-east-1:12345:slack-notifications",
  "arn:aws:sns:us-east-1:12345:email-notifications"
]
