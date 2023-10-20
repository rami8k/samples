import os
from datetime import datetime, timedelta
import boto3
import logging
import json

import settings
from data_adapter.Config import Config
from data_adapter.Items import Items
from data_adapter.RecentItems import RecentItems
from services.Bwrite import Bwrite
from utils.database_schema import to_item_schema, to_recent_item_schema
from utils.date import in_weekend_range

logging.basicConfig(level = logging.INFO)
log = logging.getLogger(__name__)

def get_dupes(items):
    seen = set()
    seen2 = set()
    seen_add = seen.add
    seen2_add = seen2.add
    for item in items:
        if item in seen:
            seen2_add(item)
        else:
            seen_add(item)
    return list(seen2)

def main():
    log.info('Started...')

    pull_date = os.getenv('PULL_DATE')
    log.info('pull date" %s' % pull_date)
    bwrite = Bwrite()
    items = bwrite.get_articles(pull_date)

    items_ids = [o['id'] for o in items]
    dup_items_ids = get_dupes(items_ids)
    dup_items = [item for item in items if item['id'] in dup_items_ids]

    log.info('new items: %s' % len(items))
    log.info('dup items: %s' % dup_items)

    deleted_items = []
    for item in dup_items:
        if item['id'] not in deleted_items:
            deleted_items.append(item['id'])
            items.remove(item)

    items_count = len(items)
    print('new items: %s' % (items_count))

    if items_count > 0:
        mapped_items = to_item_schema(items)
        items_store = Items()
        items_store.save_items(mapped_items)

        mapped_items = to_recent_item_schema(items[:1000])
        recent_items_store = RecentItems()
        recent_items_store.save_items(mapped_items)

    config_store = Config()
    config_store.save_item('itemsPullDate', datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'))

    log.info('Finished')

if __name__ == "__main__":
    main()
