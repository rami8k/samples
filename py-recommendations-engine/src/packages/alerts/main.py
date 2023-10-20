import os
import requests
import json
from datetime import datetime, timedelta
import logging
import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def getSlackWebhookUrl():
    client = boto3.client('ssm')

    response = client.get_parameter(
        Name='/BU/all/slackWebHookUrl',
        WithDecryption=True
    )

    return response['Parameter']['Value']

# send notifications to a slack channel
def handler(event, context):
    logger.info("Sending slack notification ...")

    message = json.loads(event["Records"][0]["Sns"]["Message"])

    alarm_description = message["AlarmDescription"]
    new_state = message["NewStateValue"]
    reason = message["NewStateReason"]

    formatted_message = "BU-Recommendations AWS/lambda error"

    data = {
        "text": formatted_message,
        "username": "AWS",
        "icon_emoji": ":x:",
        "attachments": [
            { "text": "details: %s" % (alarm_description)},
            { "text": "env: %s" % (os.getenv("ENV_TYPE")) },
            { "text": "reason: %s" % (reason) }
        ]
    }

    response = requests.post(
        getSlackWebhookUrl(), 
        data=json.dumps(data), headers={"Content-Type": "application/json"}
    )