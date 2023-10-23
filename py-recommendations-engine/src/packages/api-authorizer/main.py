import os
import jwt
import logging
import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def getSecret():
    client = boto3.client('ssm')

    response = client.get_parameter(
        Name='/team/all/JWT_SECRET',
        WithDecryption=True
    )

    return response['Parameter']['Value']

def get_token(token):
    token_parts = token.split(' ')
    if len(token_parts) == 1:
        return token
    else:
        return token_parts[1]

def handler(event, context):
    if event['authorizationToken'] is None or event['authorizationToken'] == '':
        return {
            "principalId": None,
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Deny",
                        "Resource": "*"
                    }
                ]
            }
        }

    token = get_token(event['authorizationToken'])
    secret = getSecret()
    decoded = jwt.decode(token, bytes.fromhex(secret), algorithms=['HS256'])

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
        }
    }