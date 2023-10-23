const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

import * as jwt from 'jsonwebtoken'

function getPolicy(userId) {
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
    "context" : {
      "user" : userId
    }
  }
}

async function getSecret() {
  const ssm = new AWS.SSM({ 
    region: process.env.AWS_REGION
  })

  const params = {
    Name: '/app/all/JWT_SECRET', 
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

function getUser(decoded) {
  return decoded.tracking.users.designated.id || decoded.tracking.users.shared.id || decoded.tracking.users.ip.id
}

export const handler = async(event, context, callback) => {
  if (!event.authorizationToken) {
    callback(null, getPolicy(0))
    return
  }

  var token = getToken(event.authorizationToken)
  var secret = await getSecret()

  jwt.verify(token, Buffer.from(secret, 'hex'), function(err, decoded) {
    if(err) {
      callback("Unauthorized")
    } else {
      callback(null, getPolicy(getUser(decoded)))
    }
  })
}