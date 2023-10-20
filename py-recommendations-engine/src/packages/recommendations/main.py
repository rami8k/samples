from newrelic import agent
import os
from datetime import datetime, timedelta
import logging
import json
from aws_xray_sdk.core import xray_recorder, patch_all

import settings

from services.Personalize import Personalize
from data_adapter.RecentItems import RecentItems
from utils.cors_handler import add_cors_response

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

xray_recorder.configure(service='BU-recommendations')
patch_all()

# filters is a way to refine the recommendations returned from AWS Personalize
# can be used for as business rules, ex: get recommended articles for specific channel
# filters in AWS Personalize are poorly implemented and they need lots of improvement
# this method is a workaround for mapping short filter names coming from the query string with long ones in AWS and populating their values
def get_filter(args):
    personalize = Personalize()
    filters = personalize.get_filters(os.getenv('PERSONALIZE_DATASET_GROUP_ARN'))

    log.info(args)

    # checking if filter_name1 has been passed in the query params
    if 'filter_name1' in args and args['filter_name1'] != '':
        filter_value = args['filter_name1']

        # implement logic to populate filter values to be passed and correctly formating the values
        # values must be in the format ""value1","value2"."value3""
        values_array = args['filter_value'].split(',')
        filter_values_string =  '"{0}"'.format('","'.join(values_array))  

        return {
            'filter_arn': next((x['filterArn'] for x in filters if x['name'] == 'not_in_channels_and_not_read'), None),
            'filter_values': {
                'channel': "%s" % filter_values_string
            }
        }
    # checking if filter_name2 has been passed in the query params
    elif 'filter_name2' in args and args['filter_name2'] != '':
        # do the same as filter_name1
        return {}
    # default filter to be applied if no filter is passed, or delete if not needed
    else:
        return {
            'filter_arn': next((x['filterArn'] for x in filters if x['name'] == 'default_filter'), None),
            'filter_values': {}
        }

@add_cors_response
def handler(event, context):
    xray_recorder.begin_subsegment('get recommendations')
    personalize = Personalize()

    filter = get_filter(event['queryStringParameters'])
    print(filter)

    # get recommended items from the AWS Personalize
    recommendations = personalize.get_recommendations(
        os.getenv('PERSONALIZE_SOLUTION_ARN'),
        os.getenv('PERSONALIZE_DATASET_GROUP_ARN'),
        str(event['queryStringParameters']['user']),
        { 'date': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ') },
        500, 
        filter['filter_arn'],
        filter['filter_values']
    )
    xray_recorder.end_subsegment()
    
    recommendedItems = []
    if recommendations:
        xray_recorder.begin_subsegment('get recent items')
        
        # temp hack, AWS Personalize is working on business rules that can be used. Should be replaced once available.
        # get recent items to be compared with the recommended list, to return only the recommendations that exist in the recent items
        # to make sure we are not recommending old items
        items_store = RecentItems()
        latest_items = items_store.get_all()
        xray_recorder.end_subsegment()

        # only need item ids for comparison
        latest_items_ids = [x['ItemId'] for x in latest_items]

        # flatten the recommendations list
        recommendations = list(map(lambda x : x['itemId'], recommendations))

        # make sure the recommended item are in the latest items set
        recommendedItems = [item for item in recommendations if item in latest_items_ids]
        # return the requested count
        recommendedItems = recommendedItems[:int(event['queryStringParameters']['count'])]

    return {
        "isBase64Encoded": "false",
        "statusCode": "200",
        "body": json.dumps(recommendedItems)
    }