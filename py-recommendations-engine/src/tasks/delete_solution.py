import os
from datetime import datetime
import logging
import requests
import boto3

import settings
from services.Personalize import Personalize
from services.Bwrite import Bwrite
from data_adapter.Items import Items
from utils.dataset_schema import to_dataset_schema

logging.basicConfig(level = logging.INFO)
log = logging.getLogger(__name__)

def main():
    log.info('Started...')

    iteration_name = datetime.today().strftime('%m-%d-%y-%H%M')

    personalize_client = Personalize()

    log.info('deleting campaigns')
    campaigns = personalize_client.get_campaigns(os.getenv('PERSONALIZE_SOLUTION_ARN'))
    for campaign in campaigns:
        personalize_client.delete_campaign(campaign['campaignArn'])

    log.info('deleting filters')
    filters = personalize_client.get_filters(os.getenv('PERSONALIZE_DATASET_GROUP_ARN'))
    for filter in filters:
        personalize_client.delete_filter(filter['filterArn'])

    for filter in filters:
        personalize_client.wait_delete_filter(filter['filterArn'])

    log.info('deleting event trackers')
    event_trackers = personalize_client.get_event_trackers(os.getenv('PERSONALIZE_SOLUTION_ARN'))
    for event_tracker in event_trackers:
        personalize_client.delete_event_tracker(event_tracker['eventTrackerArn'])

    log.info('waiting campaigns deletion')
    for campaign in campaigns:
        personalize_client.wait_delete_campaign(campaign['campaignArn'])

    log.info('deleting solution')
    personalize_client.delete_solution(os.getenv('PERSONALIZE_SOLUTION_ARN'))
    log.info('waiting delete solution')
    personalize_client.wait_delete_solution(os.getenv('PERSONALIZE_SOLUTION_ARN'))

    log.info('deleting datasets')
    datasets = personalize_client.get_datasets(os.getenv('PERSONALIZE_DATASET_GROUP_ARN'))
    for dataset in datasets:
        personalize_client.delete_dataset(dataset['datasetArn'])
    log.info('waiting delete datasets')
    for dataset in datasets:
        personalize_client.wait_delete_dataset(dataset['datasetArn'])

    log.info('delete dataset group')
    dataset_group_arn = personalize_client.delete_dataset_group(os.getenv('PERSONALIZE_DATASET_GROUP_ARN'))
    log.info('waiting delete dataset group')
    personalize_client.wait_delete_dataset_group(os.getenv('PERSONALIZE_DATASET_GROUP_ARN'))

    log.info('Finished')

if __name__ == "__main__":
    main()