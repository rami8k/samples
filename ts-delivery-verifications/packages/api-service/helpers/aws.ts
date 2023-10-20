import * as SSM from 'aws-sdk/clients/ssm'
import { captureAWSClient } from 'aws-xray-sdk-core'

const awsConnectionParams = { region: process.env.AWS_REGION }
const ssm = process.env.AWS ? captureAWSClient(new SSM(awsConnectionParams)) : new SSM(awsConnectionParams)

export async function getSecret(name: string): Promise<any> {
  const params = {
    Name: name, 
    WithDecryption: true
  }

  try {
    const result = await ssm.getParameter(params).promise()
    return {
      value: result.Parameter.Value,
      lastModified: result.Parameter.LastModifiedDate
    }
  } catch(err) {
    return null
  }
}

export async function saveSecret(name: string, value: string): Promise<void> {
  const params = {
    Name: name, 
    WithDecryption: true
  }

  await ssm.putParameter({
    Name: name,
    Value: value,
    Type: 'SecureString'
  }).promise()
}