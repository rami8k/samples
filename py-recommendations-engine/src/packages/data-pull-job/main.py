from newrelic import agent
import os
import time
from datetime import datetime, timedelta
import boto3
import logging
import json

import settings
from data_adapter.Config import Config
from data_adapter.Items import Items
from data_adapter.RecentItems import RecentItems
from services.Items import Items, ItemsError
from services.Personalize import Personalize

from utils.database_schema import to_item_schema, to_recent_item_schema
from utils.dataset_schema import to_dataset_items_schema
from utils.date import in_weekend_range
from utils.list import chunks

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

# add items to the current mpdel
def put_items(items):
    personalize_client = Personalize()
    items_ds_schema = personalize_client.get_schema(os.getenv("PERSONALIZE_ITEMS_DATASET_ARN"))
    processed_items = to_dataset_items_schema(items, items_ds_schema).to_dict('records')

    processed_items_list = [processed_items[i:i + 10] for i in range(0, len(processed_items), 10)]
    log.info(processed_items_list)

    personalize_client = Personalize()
    for items_list in  processed_items_list:
        put_items_input = [{'itemId': item['itemId'], 'properties': json.dumps({key: value for key, value in item.items() if key != 'itemId'})} for item in items_list]
        personalize_client.put_items(os.getenv("PERSONALIZE_ITEMS_DATASET_ARN"), put_items_input)
        log.info('put_items_input')
        log.info(put_items_input)

        if len(processed_items_list) > 1:
            time.sleep(1)

def items_pull(pull_date):
    try:
        items = Items().get_items(pull_date)
    except ItemsError as error:
        log.error(f'Received error while getting items: {error}')
        items = []

    items_count = len(items)
    log.info("new items: %s" % items_count)

    if items_count > 0:
        # mapping items array to items table schema
        mapped_items = to_item_schema(items)
        items_store = Items()
        items_store.save_items(mapped_items)

        # mapping items array to recent items table schema
        mapped_items = to_recent_item_schema(items)
        recent_items_store = RecentItems()
        recent_items_store.save_items(mapped_items)

        # number of days to consider item as recent, 2 days during the weekdays, 4 day over the weekend if no new items are added over the weekend to avoid getting no recommendations
        days_to_retain = 2 if datetime.today().weekday() in [2, 3, 4, 5] else 4

        # cleaning items tables to not include old items in the daily trained model, delete items that are older than x days (ex 2 years)
        old_items_date = int((datetime.now() - timedelta(hours = 24 * days_to_retain)).strftime("%Y%m%d"))
        recent_items_store.delete_older_items(old_items_date, 'article')

        # call to add new items to the current model
        put_items(items)

    return items

def handler(event, context):
    log.info('Updating data tables...')

    config = Config()
    pull_date = config.get('itemsPullDate')
    log.info("pull date: %s" % pull_date)

    new_pull_date = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    if pull_date is None:
        pull_date = new_pull_date

    # call to update items table
    items_pull(pull_date)
    
    # store last pull date
    config_store = Config()
    config_store.save_item('itemsPullDate', new_pull_date)