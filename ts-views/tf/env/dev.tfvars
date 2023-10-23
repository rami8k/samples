env                 = "dev"
target_account_id   = "12345"
domain              = "app-views-d.domain.com"
newrelic_app_name   = "app-Views-d"
bwrite_url          = "https://domain.com/graphql"
newrelic_account_id = "1234"
notification_topics_east = [
  "arn:aws:sns:us-east-1:12345:app-slack-notifications",
  "arn:aws:sns:us-east-1:12345:app-email-notifications"
]
notification_topics_west = [
  "arn:aws:sns:us-west-2:12345:app-slack-notifications",
  "arn:aws:sns:us-west-2:12345:app-email-notifications"
]
vpc_id_east              = "vpc-1"
vpc_id_west              = "vpc-2"
vpc_private_subnets_east = ["subnet-1", "subnet-2", "subnet-3"]
vpc_private_subnets_west = ["subnet-4", "subnet-5", "subnet-6"]
