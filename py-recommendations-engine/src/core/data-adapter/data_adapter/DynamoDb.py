from datetime import datetime
import boto3
import logging

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class DynamoDb:
    def __init__(self, table):
        dynamodb = boto3.resource('dynamodb',
            aws_access_key_id='ASIAWXRJTNTNTN2RTTQI',
            aws_secret_access_key='v5pRBL0/cHZC2GFVGKq7f8p8nwYhNlrU6UzoxtfZ',
            aws_session_token='FwoGZXIvYXdzEBwaDNi2WVarjXyzjgDmpSLQAZEyI54RuC/oSv858ag3CXTODYElINlMGM1wVAOvabZMjxRHTfBKGs3nunN8suCPq1DJCr2HlDihXDmQ9OZ/LkD3TARVcQPKXvPRZIu+kmy5+Bqi3RY9KDUrxWv6VdiXqTgPQZoBLkZEOWY0JV+TgrMhMXKvyuKiuXJyBtUJj5mXq/DmiaMUVreaAERN19A10kOW7W/yj1uLVdfS5n3hgc/YQToifm30zF4lUWYbSGvQhc8KwRIZglTETCXXspDSE9DkvN0IPzxVcG1ekZvpbyMo6PzlhAYyKzcvG5q2AIC6E1ojBXfVCH+k8EZlwx1XeSArX6w9TIhl920UpMEM6v6lTPc='
        )
        self.table = dynamodb.Table(table)

    def get(self, key):
        response = self.table.get_item(
            Key=key
        )

        if hasattr(response, 'Item'):
            return response['Item']['Value']
        return None

    def get_all(self):
        response = self.table.scan()
        data = response['Items']

        while response.get('LastEvaluatedKey'):
            response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            data.extend(response['Items'])

        return data
    
    def save_item(self, item):
        response = self.table.put_item(
            Item=item
        )

    def save_items(self, items):
        with self.table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)

    def delete_items(self, keys):
        with self.table.batch_writer() as batch:
            for key in keys:
                batch.delete_item(
                    Key=key
                )
