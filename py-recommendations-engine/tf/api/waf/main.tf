resource "aws_wafv2_web_acl" "acl" {
  name        = "${var.name}-acl"
  scope       = "REGIONAL"
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.name}-acl"
    sampled_requests_enabled   = true
  }

  default_action {
    allow {}
  }

  rule {
    name     = "${var.name}-bot-blocking"
    priority = 0

    action {
      block {}
    }

    statement {
      byte_match_statement {
        positional_constraint = "CONTAINS"
        search_string         = "bot"

        text_transformation {
          priority = 0
          type     = "LOWERCASE"
        }

        field_to_match {
          single_header { 
            name = "user-agent"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name}-bot-blocking"
      sampled_requests_enabled   = true
    }
  }

  tags = var.tags
}