import os
from datetime import datetime
import logging
import requests
import boto3
from botocore.exceptions import ClientError

import settings
from services.Personalize import Personalize
from services.Bwrite import Bwrite
from data_adapter.Items import Items
from utils.items_schema import 
from utils.dataset_schema import to_dataset_schema

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

def s3_file_exists(bucket_name, key):
    s3_client = boto3.client(service_name = 's3')
    try:
        obj = s3_client.head_object(Bucket=bucket_name, Key=key)
        return True
    except ClientError as exc:
        if exc.response['Error']['Code'] != '404':
            return False
    return False

def main():
    log.info('Started...')

    users_file_available = s3_file_exists(os.getenv('BUCKET_NAME'), '{}/{}'.format(os.getenv('INITIAL_SOLUTION_DATA_FOLDER'), 'users.csv'))

    iteration_name = datetime.today().strftime('%m-%d-%y-%H%M')

    personalize_client = Personalize()

    log.info('creating interactions schema')
    interactions_schema_arn = ''
    interactions_schema_file = os.path.join(os.path.dirname(__file__), 'schemas/interactions_schema.json')
    with open(interactions_schema_file, 'r') as schema_file:
        schema = schema_file.read()
        interactions_schema_arn = personalize_client.create_schema('interactions-' + iteration_name, schema)

    log.info('creating items schema')
    items_schema_arn = ''
    items_schema_file = os.path.join(os.path.dirname(__file__), 'schemas/items_schema.json')
    with open(items_schema_file, 'r') as schema_file:
        schema = schema_file.read()
        items_schema_arn = personalize_client.create_schema('items-' + iteration_name, schema)

    if users_file_available:
        log.info('creating users schema')
        users_schema_arn = ''
        users_schema_file = os.path.join(os.path.dirname(__file__), 'schemas/users_schema.json')
        with open(users_schema_file, 'r') as schema_file:
            schema = schema_file.read()
            users_schema_arn = personalize_client.create_schema('users-' + iteration_name, schema)

    log.info('creating dataset group')
    dataset_group_arn = personalize_client.create_dataset_group(os.getenv('SOLUTION_NAME'))
    personalize_client.wait_dataset_group(dataset_group_arn)

    log.info('creating datasets')
    interactions_ds_arn = personalize_client.create_dataset('ds-interactions', dataset_group_arn, interactions_schema_arn, 'INTERACTIONS')
    items_ds_arn = personalize_client.create_dataset('ds-items', dataset_group_arn, items_schema_arn, 'ITEMS')
    
    if users_file_available:
        users_ds_arn = personalize_client.create_dataset('ds-users', dataset_group_arn, users_schema_arn, 'USERS')

    log.info('creating import jobs')
    base_s3_path = 's3://{}/{}'.format(os.getenv('BUCKET_NAME'), os.getenv('INITIAL_SOLUTION_DATA_FOLDER'))
    interactions_file = '{}/{}'.format(base_s3_path, 'interactions.csv')
    interactions_import_job_arn = personalize_client.create_import_job("import-interactions-" + datetime.today().strftime('%m-%d-%y-%H%M'), interactions_ds_arn, os.getenv('PERSONALIZE_ROLE'), interactions_file)

    items_file = '{}/{}'.format(base_s3_path, 'items.csv')
    items_import_job_arn = personalize_client.create_import_job("import-items-" + datetime.today().strftime('%m-%d-%y-%H%M'), items_ds_arn, os.getenv('PERSONALIZE_ROLE'), items_file)

    if users_file_available:
        users_file = '{}/{}'.format(base_s3_path, 'users.csv')
        users_import_job_arn = personalize_client.create_import_job("import-users-" + datetime.today().strftime('%m-%d-%y-%H%M'), users_ds_arn, os.getenv('PERSONALIZE_ROLE'), users_file)

    log.info('waiting import jobs')
    personalize_client.wait_import_job(interactions_import_job_arn, 30)
    personalize_client.wait_import_job(items_import_job_arn, 30)

    if users_file_available:
        personalize_client.wait_import_job(users_import_job_arn, 30)

    solution_config = {
        "featureTransformationParameters": {
            "max_user_history_length_percentile": "0.99",
            "min_user_history_length_percentile": "0.01"
        }
    }

    log.info('creating solution')
    PERSONALIZE_SOLUTION_ARN = personalize_client.create_solution(os.getenv('SOLUTION_NAME'), dataset_group_arn, solution_config)

    log.info('creating solution version')
    solution_version_arn = personalize_client.create_solution_version(PERSONALIZE_SOLUTION_ARN)
    log.info('waiting solution version')
    personalize_client.wait_solution_version(solution_version_arn, 360)

    log.info('creating campaign')
    personalize_client.create_campaign('BU-recommendations-campaign' + iteration_name, solution_version_arn, 
        {
            "itemExplorationConfig": {"explorationWeight": "0.7", "explorationItemAgeCutOff": "1"}
        }
    )
    log.info('creating event tracker')
    personalize_client.create_event_tracker('BU-event-tracker', dataset_group_arn)
    log.info('creating filter')
    personalize_client.create_filter('user-visits', dataset_group_arn, 'EXCLUDE itemId WHERE INTERACTIONS.event_type IN ("click","view")')

    log.info('Finished')

if __name__ == "__main__":
    main()