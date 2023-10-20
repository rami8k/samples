resource "aws_dynamodb_table" "recommendations_config" {
  name           = "recommendations.Config"
  billing_mode   = "PAY_PER_REQUEST"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "Key"

  attribute {
    name = "Key"
    type = "S"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "recommendations_items" {
  name           = "recommendations.Items"
  billing_mode   = "PAY_PER_REQUEST"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "ItemId"
  range_key      = "TTL"

  attribute {
    name = "ItemId"
    type = "S"
  }

  attribute {
    name = "TTL"
    type = "N"
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "recommendations_recent_items" {
  name           = "recommendations.RecentItems"
  billing_mode   = "PAY_PER_REQUEST"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "ItemId"
  range_key      = "TTL"

  attribute {
    name = "ItemId"
    type = "S"
  }

  attribute {
    name = "ItemType"
    type = "S"
  }

  attribute {
    name = "UpdatedDay"
    type = "N"
  }

  attribute {
    name = "PostedDay"
    type = "N"
  }

  attribute {
    name = "TTL"
    type = "N"
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  global_secondary_index {
    name               = "GSI_UpdatedDay"
    hash_key           = "ItemType"
    range_key          = "UpdatedDay"
    write_capacity     = 10
    read_capacity      = 10
    projection_type    = "INCLUDE"
    non_key_attributes = ["ItemId"]
  }

  global_secondary_index {
    name               = "GSI_PostedDay"
    hash_key           = "ItemType"
    range_key          = "PostedDay"
    write_capacity     = 10
    read_capacity      = 10
    projection_type    = "INCLUDE"
    non_key_attributes = ["ItemId"]
  }

  tags = var.tags
}
