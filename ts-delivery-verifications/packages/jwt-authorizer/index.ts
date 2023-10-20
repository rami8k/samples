import * as jwt from 'jsonwebtoken'
import * as SSM from 'aws-sdk/clients/ssm'
import { captureAWS } from 'aws-xray-sdk-core'
const xSSM = process.env.AWS ? captureAWS(SSM) : SSM

function getPolicy(appKey, email) {
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
      "appKey": appKey,
      "email": email
    }
  }
}

async function getSecret() {
  const ssm = new xSSM({ 
    region: process.env.AWS_REGION
  })

  const params = {
    Name: '/BU/all/JWT_SECRET', 
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
    callback(null)
    return
  }

  var token = getToken(event.authorizationToken)
  var secret = await getSecret()

  jwt.verify(token, secret, function(err, decoded) {
    if(err) {
      callback("Unauthorized")
    } else {
      callback(null, getPolicy(decoded.appKey, decoded.email))
    }
  })
}