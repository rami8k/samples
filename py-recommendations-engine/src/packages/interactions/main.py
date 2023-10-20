from newrelic import agent
import os
from datetime import datetime, timedelta
import logging
import json
from aws_xray_sdk.core import xray_recorder, patch_all

import settings

from services.Personalize import Personalize
from services.Interactions import Interactions
from data_adapter.RecentItems import RecentItems
from utils.date import to_timestamp
from utils.cors_handler import add_cors_response

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

xray_recorder.configure(service='BU-recommendations')
patch_all()

# send interactions to the solution
def send_interaction(solutionArn, params):
    personalize = Personalize()

    log.info('send_interaction %s' % params)
    print(json.dumps(params['properties']))

    if 'eventValue' not in params['properties']:
        params['properties']['eventValue'] = 1

    add_interaction_result = personalize.add_interaction(
        solutionArn,
        str(params['sessionId']),
        str(params['userId']),
        [
            {
                'eventType': params['eventType'],
                'properties': json.dumps(params['properties']),
                'sentAt': datetime.now()
            }
        ]
    )
    log.info('add_interaction_result %s' % add_interaction_result)
    return add_interaction_result

# save interactions into s3 bucket
def save_interaction(params):
    interactionsStore = Interactions()

    log.info('save_interaction %s' % params)

    save_interaction_result = interactionsStore.save_interaction({
        'userId': params['userId'],
        'sessionId': params['sessionId'],
        'eventType': params['eventType'],
        'properties': params['properties'],
        'sentAt': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
    })
    return save_interaction_result

@add_cors_response
def handler(event, context):
    params = json.loads(event['body'])

    log.info(event)
    if not params["userId"].isnumeric():
        log.info('invalid user')
        return {
            "body": "invalid user id",
            "statusCode": "400"
        }

    # send interactions to the solution
    xray_recorder.begin_subsegment('send interaction')
    send_interaction_result = send_interaction(os.getenv("PERSONALIZE_SOLUTION_ARN"), params)
    xray_recorder.end_subsegment()

    # save interactions to s3 bucket using Firehose, todo: uncomment if needed
    # xray_recorder.begin_subsegment('save interaction')
    # save_interaction(params)
    # xray_recorder.end_subsegment()

    return {
        "isBase64Encoded": "false",
        "statusCode": "200"
    }