import boto3
import json

class Interactions:
    def __init__(self):
        self.firehose_client = boto3.client(service_name='firehose')

    # saves customer interactions into an S3 bucket using Firehose
    def save_interaction(self, interaction):
        put_record_response = self.firehose_client.put_record(
            DeliveryStreamName = 'BU-interactions',
            Record = {
                'Data': json.dumps(interaction)
            }
        )

        return put_record_response['ResponseMetadata']['HTTPStatusCode'] == 200
