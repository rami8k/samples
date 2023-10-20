import logging

from .DynamoDb import DynamoDb

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class Config(DynamoDb):
    def __init__(self):
        DynamoDb.__init__(self, 'recommendations.Config')

    def get(self, key):
        response = self.table.get_item(
            Key={
                'Key': key
            }
        )
        if "Item" in response:
            return response['Item']['Value']
        return None

    def save_item(self, key, value):
        self.table.put_item(
            Item={
                'Key': key,
                'Value': value
            }
        )
