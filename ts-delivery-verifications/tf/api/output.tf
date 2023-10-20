output "api_id" {
  value = aws_api_gateway_rest_api.apigw.id
}

output "api_root_id" {
  value = aws_api_gateway_rest_api.apigw.root_resource_id
}

output "endpoint" {
  value = aws_api_gateway_deployment.apigw_deployment.invoke_url
}

output "execution_arn" {
  value = aws_api_gateway_deployment.apigw_deployment.execution_arn
}

output "deployment_id" {
  value = aws_api_gateway_deployment.apigw_deployment.id
}

output "deployment_stage_name" {
  value = aws_api_gateway_deployment.apigw_deployment.stage_name
}