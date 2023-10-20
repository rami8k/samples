import os
from datetime import datetime
import logging
import numpy as np
import pandas as pd
import boto3
import io
from io import StringIO

import settings
from services.Personalize import Personalize

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

def create_filter(name, expression):
    personalize_client = Personalize()
    personalize_client.create_filter(name, os.getenv('PERSONALIZE_DATASET_GROUP_ARN'), expression)

def delete_filter(filter_arn):
    personalize_client = Personalize()
    personalize_client.delete_filter(filter_arn)

def delete_solition(PERSONALIZE_SOLUTION_ARN):
    personalize_client = Personalize()
    personalize_client.delete_solution(PERSONALIZE_SOLUTION_ARN)

def create_solution(solution_name):
    solution_config = {
        "featureTransformationParameters": {
            "cold_start_max_duration": "1",
            "cold_start_max_interactions": "15",
            "cold_start_relative_from": "currentTime",
            "max_user_history_length_percentile": "0.99",
            "min_user_history_length_percentile": "0.01"
        }
    }

    personalize_client = Personalize()
    personalize_client.create_solution(solution_name, os.getenv('PERSONALIZE_DATASET_GROUP_ARN'), solution_config)

def create_solution_version(PERSONALIZE_SOLUTION_ARN, trainingMode="FULL"):
    personalize_client = Personalize()
    solution_version_arn = personalize_client.create_solution_version(PERSONALIZE_SOLUTION_ARN, trainingMode)

def delete_campaign(campaign_arn):
    personalize_client = Personalize()
    personalize_client.delete_campaign(campaign_arn)

def create_campaign(campaign_name,solution_version_arn):
    personalize_client = Personalize()
    personalize_client.create_campaign(campaign_name, solution_version_arn, 
        {
            "itemExplorationConfig": {"explorationWeight": "0.7", "explorationItemAgeCutOff": "1"}
        }
    )

def process_interactions_file(bucket_name, folder, file_name):
    log.info('Started processing interactions')

    log.info('reading file')
    s3_client = boto3.client('s3')
    interactions_file_data = s3_client.get_object(
        Bucket = bucket_name,
        Key = '{}/{}'.format(folder, file_name)
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

def split_arg(args):
    key, value = args.split('=', 1)
    return key, value

tasks = {
    'create_filter': create_filter,
    'delete_filter': delete_filter,
    'delete_solition': delete_solition,
    'create_solution': create_solution,
    'create_solution_version': create_solution_version,
    'delete_campaign': delete_campaign,
    'create_campaign': create_campaign,
    'process_interactions_file': process_interactions_file
}

def main():
    processor = tasks.get(os.getenv('TASK_NAME'), None)

    if not processor:
        print("invalid function name:", os.getenv('TASK_NAME'))
        return

    args = {}
    if os.getenv('ARGS'):
        args_array = os.getenv('ARGS').split('||')
        args = [split_arg(x) for x in args_array]
        args = dict(args)

    processor(**args)

if __name__ == "__main__":
    main()