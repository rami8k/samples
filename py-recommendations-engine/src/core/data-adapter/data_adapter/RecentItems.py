import logging

from .DynamoDb import DynamoDb
from boto3.dynamodb.conditions import Key

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class RecentItems(DynamoDb):
    def __init__(self):
        DynamoDb.__init__(self, 'recommendations.RecentItems')

    def get_list(self, updated_day, item_type):
        response = self.table.query(
            IndexName= 'GSI_UpdatedDay',
            KeyConditionExpression='ItemType = :itemType AND UpdatedDay = :updatedDay',
            ExpressionAttributeValues={
                ':itemType': item_type,
                ':updatedDay': updated_day
            }
        )

        return list(map(lambda x: x['ItemId'], response['Items']))

    def get_older_items(self, posted_day, item_type):
        response = self.table.query(
            IndexName= 'GSI_PostedDay',
            KeyConditionExpression='ItemType = :itemType AND PostedDay < :postedDay',
            ExpressionAttributeValues={
                ':itemType': item_type,
                ':postedDay': posted_day
            }
        )

        return list(map(lambda x: { 'ItemId': x['ItemId'], 'TTL': x['TTL'] }, response['Items']))

    def delete_older_items(self, posted_day, item_type):
        print('delete items before', posted_day)
        items = self.get_older_items(posted_day, item_type)
        print('items to delete', len(items))

        with self.table.batch_writer() as batch:
            for item in items:
                batch.delete_item(
                    Key={
                        'ItemId': item['ItemId'],
                        'TTL': item['TTL']
                    }
                )
