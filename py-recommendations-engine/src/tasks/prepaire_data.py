import os
import json
import time
import numpy as np
import pandas as pd
import boto3
import io
from io import StringIO
import logging

import settings
from services.Athena import Athena
from data_adapter.Config import Config
from data_adapter.Items import Items
from data_adapter.RecentItems import RecentItems
from services.Bwrite import Bwrite
from utils.database_schema import to_item_schema, to_recent_item_schema
from services.Personalize import Personalize
from utils.dataset_schema import to_dataset_schema

logging.basicConfig(level = logging.INFO)
log = logging.getLogger(__name__)

def process_interactions(bucket_name, folder):
    log.info('Started processing interactions')

    log.info('query athena interactions')
    athena = Athena()
    query_result_file = athena.query_interactions('s3://{}/{}'.format(bucket_name, folder))
    query_result_file = query_result_file.split('/')[-1]

    log.info('read athena result file')
    s3_client = boto3.client('s3')
    interactions_file_data = s3_client.get_object(
        Bucket = bucket_name,
        Key = '{}/{}'.format(folder, query_result_file)
    )

    log.info('process raw interactions file')
    df_interactions = pd.read_csv(io.BytesIO(interactions_file_data['Body'].read()), index_col=False, dtype = {'bb_uuid': pd.Int64Dtype()})

    df_interactions['usage_date'] = pd.to_datetime(df_interactions['usage_date']).astype('int64')//1e9
    df_interactions = df_interactions.drop(columns=['atypon_id', 'Auth_method', 'data_source', 'post_evar19'])
    df_interactions = df_interactions.dropna(subset=['bb_uuid'])
    df_interactions.columns = ['ITEM_ID', 'TIMESTAMP', 'USER_ID']
    df_interactions['USER_ID'] = df_interactions['USER_ID'].astype(int)
    df_interactions = df_interactions.sort_values(by=['USER_ID'])
    df_interactions['ITEM_ID'] = df_interactions['ITEM_ID'].str.lower()
    df_interactions['TIMESTAMP'] = df_interactions['TIMESTAMP'].astype(str).replace('\.0', '', regex=True)
    df_interactions['EVENT_TYPE'] = 'view'
    df_interactions['EVENT_VALUE'] = 1

    log.info('create interactions csv')
    
    csv_buf = StringIO()
    df_interactions.to_csv(csv_buf, header=True, index=False)
    csv_buf.seek(0)

    log.info('uploading processed interactions file')
    s3_client.put_object(
        Bucket = bucket_name, 
        Body = csv_buf.getvalue(),
        Key = '{}/{}'.format(folder, 'interactions.csv')
    )

    log.info('Finished')
    
def process_items(bucket_name, folder):
    log.info('Started processing items')

    log.info('items query')
    items_store = Items()
    items = items_store.get_all()
    items = map(lambda x: x['metadata'], items) 

    log.info('process schema')
    items = list(items)
    print(len(items))

    items_csv = ''
    schema_file = os.path.join(os.path.dirname(__file__), 'schemas/items_schema.json')
    with open(schema_file, 'r') as schema_file:
        schema = json.loads(schema_file.read())['fields']
        items_csv = to_dataset_schema(items, schema)

    log.info('uploading items file')
    s3_client = boto3.client(service_name = 's3')
    s3_client.put_object(
        Bucket = bucket_name,
        Key = '{}/{}'.format(folder, 'items.csv'),
        Body = items_csv
    )

def main():
    log.info('Started...')

    process_items(os.getenv('BUCKET_NAME'), os.getenv('INITIAL_SOLUTION_DATA_FOLDER'))
    process_interactions(os.getenv('BUCKET_NAME'), os.getenv('INITIAL_SOLUTION_DATA_FOLDER'))

if __name__ == "__main__":
    main()