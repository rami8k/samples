from datetime import datetime
from dateutil.relativedelta import relativedelta
from .date import parse_iso, to_timestamp

def __map_item(item):
    posted_date = to_timestamp(parse_iso(item['postedDate'], len(item['postedDate']) > 21)) if item['postedDate'] else 0
    cms_update_date = to_timestamp(parse_iso(item['cmsUpdateDate'], len(item['cmsUpdateDate']) > 21)) if item['cmsUpdateDate'] else posted_date

    ttl = to_timestamp(parse_iso(item['postedDate'], len(item['postedDate']) > 21) + relativedelta(years=+2)) if item['postedDate'] else to_timestamp(datetime.now() + relativedelta(years=+2))

    return {
        'ItemId': item['id'],
        'postedDate': posted_date,
        'cmsUpdateDate': cms_update_date,
        'metadata': item,
        'TTL': ttl
    }

# map items from te API datasource to items DynamoDb table schema
def to_item_schema(items):
    return map(__map_item, items)

def __map_recent_items(item):
    posted_date = parse_iso(item['postedDate'], len(item['postedDate']) > 21) if item['postedDate'] else datetime.now()
    cms_update_date = parse_iso(item['cmsUpdateDate'], len(item['cmsUpdateDate']) > 21) if item['cmsUpdateDate'] else posted_date

    weekday = datetime.today().weekday()
    ttl_days = 2 if datetime.today().weekday() in [2, 3, 4, 5] else 4
    ttl = to_timestamp(parse_iso(item['postedDate'], len(item['postedDate']) > 21) + relativedelta(days=+ttl_days)) if item['postedDate'] else to_timestamp(datetime.now() + relativedelta(days=+ttl_days))

    return {
        'ItemId': item['id'],
        'ItemType': 'article',
        'UpdatedDay': int(cms_update_date.strftime("%Y%m%d")),
        'PostedDay': int(posted_date.strftime("%Y%m%d")),
        'TTL': ttl
    }

# map items to recent items DynamoDb table schema
def to_recent_item_schema(items):
    return map(__map_recent_items, items)