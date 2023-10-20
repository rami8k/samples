import * as SSM from 'aws-sdk/clients/ssm'
import { captureAWS } from 'aws-xray-sdk-core'
const xSSM = process.env.AWS ? captureAWS(SSM) : SSM

function getPolicy() {
  return {
    "principalId": "user",
    "policyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "execute-api:Invoke",
          "Effect": "Allow",
          "Resource": "*"
        }
      ]
    },
    "context": {
      "user": "admin"
    }
  }
}

async function getSecret() {
  const ssm = new xSSM({ 
    region: process.env.AWS_REGION
  })

  const params = {
    Name: '/team/edv/ADMIN_PASS', 
    WithDecryption: true
  }

  const result = await ssm.getParameter(params).promise()
  return result.Parameter.Value;
}

function getToken(authorizationToken) {
  if (authorizationToken && authorizationToken.split(' ')[0] === 'Bearer') {
    return authorizationToken.split(' ')[1]
  } else {
    return authorizationToken
  }
}

export const handler = async(event, context, callback) => {
  if (!event.authorizationToken) {
    callback("Unauthorized")
    return
  }

  var token = getToken(event.authorizationToken)
  var secret = await getSecret()

  if (token !== secret) {
    callback("Unauthorized")
  } else {
    callback(null, getPolicy())
  }
}