import logging

from .DynamoDb import DynamoDb
from boto3.dynamodb.conditions import Key

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class Items(DynamoDb):
    def __init__(self):
        DynamoDb.__init__(self, 'recommendations.Items')