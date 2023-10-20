import os
import time
import logging
import boto3

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class Athena:
    def __init__(self):
        self.athen_client = boto3.client(service_name = 'athena')

        # Athena interactions query
        self.interactions_query = """SELECT ltrim(regexp_replace(regexp_replace(regexp_replace(post_prop68,'DK:',''),'',''),'','')) AS bw_article_id,
            date_time AS usage_date,
            post_evar25 bb_uuid,
            post_evar12 atypon_id,
            POST_EVAR28 Auth_method,
            'adobe_blawlog' as data_source,
            post_evar19
            FROM   adobe.ADOBE_blawlog
            WHERE  length(POST_PROP68) > 31
            AND  (post_evar19 != 'Internal' or post_evar19 is null)
            AND  date_trunc('day', date_time) > date '2018-12-31'
            AND  strpos(event_list,'267') > 0
            AND  page_event = 0
            order by usage_date desc"""

        # Athena items query
        self.items_query = """
            """

        # Athena users query
        self.users_query = """
            """

    # directly querying AWS Athena
    def athena_query(self, database, destination_s3_path, query):
        response = self.athen_client.start_query_execution(
            QueryString = query,
            QueryExecutionContext = {
                'Database': database
            },
            ResultConfiguration = {
                'OutputLocation': destination_s3_path
            }
        )
        return response

    # Wait for query execution
    # wait_duration: total duration to wait
    # sleep_duration: time in secs to check for query execution status
    def wait_athena_query(self, query_execution_id, wait_duration = 900, sleep_duration = 5):
        state = 'RUNNING'

        max_time = time.time() + wait_duration
        while (time.time() < max_time):
            response = self.athen_client.get_query_execution(QueryExecutionId = query_execution_id)

            if 'QueryExecution' in response and \
                    'Status' in response['QueryExecution'] and \
                    'State' in response['QueryExecution']['Status']:
                state = response['QueryExecution']['Status']['State']
                log.info(state)
                if state == 'FAILED':
                    log.info(response)
                    return False
                elif state == 'SUCCEEDED':
                    s3_path = response['QueryExecution']['ResultConfiguration']['OutputLocation']
                    return s3_path
            time.sleep(sleep_duration)
        
        return False

    # query athena for users dataset
    def query_users(self, destination_s3_path):
        athena_query_response = self.athena_query('users', destination_s3_path, self.users_query)
        return self.wait_athena_query(athena_query_response['QueryExecutionId'])

    # query athena for items dataset
    def query_items(self, destination_s3_path):
        athena_query_response = self.athena_query('adobe', destination_s3_path, self.items_query)
        return self.wait_athena_query(athena_query_response['QueryExecutionId'])

    # query athena for interactions dataset
    def query_interactions(self, destination_s3_path):
        athena_query_response = self.athena_query('adobe', destination_s3_path, self.interactions_query)
        return self.wait_athena_query(athena_query_response['QueryExecutionId'])