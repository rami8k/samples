import os
import time
import logging
import boto3
import json

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

class Personalize:
    def __init__(self):
        self.personalize_service = boto3.client(service_name = 'personalize',
            aws_access_key_id='ASIAWXRJTNTNTN2RTTQI',
            aws_secret_access_key='v5pRBL0/cHZC2GFVGKq7f8p8nwYhNlrU6UzoxtfZ',
            aws_session_token='FwoGZXIvYXdzEBwaDNi2WVarjXyzjgDmpSLQAZEyI54RuC/oSv858ag3CXTODYElINlMGM1wVAOvabZMjxRHTfBKGs3nunN8suCPq1DJCr2HlDihXDmQ9OZ/LkD3TARVcQPKXvPRZIu+kmy5+Bqi3RY9KDUrxWv6VdiXqTgPQZoBLkZEOWY0JV+TgrMhMXKvyuKiuXJyBtUJj5mXq/DmiaMUVreaAERN19A10kOW7W/yj1uLVdfS5n3hgc/YQToifm30zF4lUWYbSGvQhc8KwRIZglTETCXXspDSE9DkvN0IPzxVcG1ekZvpbyMo6PzlhAYyKzcvG5q2AIC6E1ojBXfVCH+k8EZlwx1XeSArX6w9TIhl920UpMEM6v6lTPc='
        )
        self.personalize_runtime = boto3.client(service_name = 'personalize-runtime',
            aws_access_key_id='ASIAWXRJTNTNTN2RTTQI',
            aws_secret_access_key='v5pRBL0/cHZC2GFVGKq7f8p8nwYhNlrU6UzoxtfZ',
            aws_session_token='FwoGZXIvYXdzEBwaDNi2WVarjXyzjgDmpSLQAZEyI54RuC/oSv858ag3CXTODYElINlMGM1wVAOvabZMjxRHTfBKGs3nunN8suCPq1DJCr2HlDihXDmQ9OZ/LkD3TARVcQPKXvPRZIu+kmy5+Bqi3RY9KDUrxWv6VdiXqTgPQZoBLkZEOWY0JV+TgrMhMXKvyuKiuXJyBtUJj5mXq/DmiaMUVreaAERN19A10kOW7W/yj1uLVdfS5n3hgc/YQToifm30zF4lUWYbSGvQhc8KwRIZglTETCXXspDSE9DkvN0IPzxVcG1ekZvpbyMo6PzlhAYyKzcvG5q2AIC6E1ojBXfVCH+k8EZlwx1XeSArX6w9TIhl920UpMEM6v6lTPc='
        )
        self.personalize_events_client = boto3.client(service_name = 'personalize-events',
            aws_access_key_id='ASIAWXRJTNTNTN2RTTQI',
            aws_secret_access_key='v5pRBL0/cHZC2GFVGKq7f8p8nwYhNlrU6UzoxtfZ',
            aws_session_token='FwoGZXIvYXdzEBwaDNi2WVarjXyzjgDmpSLQAZEyI54RuC/oSv858ag3CXTODYElINlMGM1wVAOvabZMjxRHTfBKGs3nunN8suCPq1DJCr2HlDihXDmQ9OZ/LkD3TARVcQPKXvPRZIu+kmy5+Bqi3RY9KDUrxWv6VdiXqTgPQZoBLkZEOWY0JV+TgrMhMXKvyuKiuXJyBtUJj5mXq/DmiaMUVreaAERN19A10kOW7W/yj1uLVdfS5n3hgc/YQToifm30zF4lUWYbSGvQhc8KwRIZglTETCXXspDSE9DkvN0IPzxVcG1ekZvpbyMo6PzlhAYyKzcvG5q2AIC6E1ojBXfVCH+k8EZlwx1XeSArX6w9TIhl920UpMEM6v6lTPc='
        )

    def create_schema(self, name, schema):
        create_schema_response = self.personalize_service.create_schema(
            name = name, 
            schema = schema
        )

        return create_schema_response['schemaArn']

    def create_dataset_group(self, name):
        dataset_group_response = self.personalize_service.create_dataset_group(
            name = name
        )

        return dataset_group_response['datasetGroupArn']

    def wait_dataset_group(self, dataset_group_arn, wait_duration = 10, sleep_duration = 180):
        status = None
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            describe_dataset_group_response = self.personalize_service.describe_dataset_group(
                datasetGroupArn = dataset_group_arn
            )
            status = describe_dataset_group_response["datasetGroup"]["status"]
            log.info("DatasetGroup: {}".format(status))
            
            if status == "ACTIVE" or status == "CREATE FAILED":
                break
                
            time.sleep(sleep_duration)

        return status

    def delete_dataset_group(self, dataset_group_arn):
        try:
            delete_dataset_group_response = self.personalize_service.delete_dataset_group(
                datasetGroupArn = dataset_group_arn
            )

            return delete_dataset_group_response
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            log.info('DatasetGroup does not exist')

    def wait_delete_dataset_group(self, dataset_group_arn, wait_duration = 10, sleep_duration = 10):
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            try:
                describe_dataset_group_response = self.personalize_service.describe_dataset_group(
                    datasetGroupArn = dataset_group_arn
                )
                status = describe_dataset_group_response["datasetGroup"]["status"]
                log.info("DatasetGroup: {}".format(status))
                
                time.sleep(sleep_duration)
            except self.personalize_service.exceptions.ResourceNotFoundException as error:
                log.info('DELETED')
                break

    def create_dataset(self, name, dataset_group_arn, schema_arn, dataset_type):
        create_dataset_response = self.personalize_service.create_dataset(
            name = name,
            datasetType = dataset_type,
            datasetGroupArn = dataset_group_arn,
            schemaArn = schema_arn,
        )

        return create_dataset_response['datasetArn']

    def wait_dataset(self, dataset_arn, wait_duration = 1, sleep_duration = 10):
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            describe_dataset_response = self.personalize_service.describe_dataset(
                datasetArn = dataset_arn
            )
            status = describe_dataset_response["dataset"]["status"]
            log.info("Dataset: {}".format(status))
        
            if status == "ACTIVE":
                break
                
            time.sleep(sleep_duration)

        return status

    def dataset_exists(self, dataset_arn):
        try:
            self.personalize_service.describe_dataset(
                datasetArn = dataset_arn
            )
            
            return True
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            return False

    def get_datasets(self, dataset_group_arn):
        list_datasets_response = self.personalize_service.list_datasets(
            datasetGroupArn = dataset_group_arn
        )

        return list_datasets_response['datasets']

    def delete_dataset(self, dataset_arn):
        try:
            delete_dataset_response = self.personalize_service.delete_dataset(
                datasetArn = dataset_arn
            )

            return delete_dataset_response
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            log.info('Dataset does not exist')

    def wait_delete_dataset(self, dataset_arn, wait_duration = 10, sleep_duration = 10):
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            try:
                describe_dataset_response = self.personalize_service.describe_dataset(
                    datasetArn = dataset_arn
                )
                status = describe_dataset_response["dataset"]["status"]
                log.info("Dataset: {}".format(status))

                time.sleep(sleep_duration)
            except self.personalize_service.exceptions.ResourceNotFoundException as error:
                log.info('DELETED')
                break

    def create_solution(self, name, dataset_group_arn, solution_config, recipe_name = 'aws-user-personalization'):
        create_solution_response = self.personalize_service.create_solution(
            name = name, 
            recipeArn = 'arn:aws:personalize:::recipe/' + recipe_name, 
            datasetGroupArn = dataset_group_arn,
            solutionConfig = solution_config
        )

        return create_solution_response['solutionArn']

    def solution_exists(self, solution_arn):
        try:
            describe_solution_response = self.personalize_service.describe_solution(
                solutionArn = solution_arn
            )
            return True
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            return False

    def wait_solution(self, solution_arn, wait_duration = 360, sleep_duration = 900):
        status = None
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            describe_solution_response = self.personalize_service.describe_solution(
                solutionArn = solution_arn
            )
            status = describe_solution_response["solutionVersion"]["status"]
            log.info("SolutionVersion: {}".format(status))

            if status == "CREATE FAILED":
                log.info(describe_solution_response['solutionVersion']['failureReason'])
                break
            
            if status == "ACTIVE":
                break
                
            time.sleep(sleep_duration)

        return status

    def delete_solution(self, solution_arn):
        try:
            delete_solution_response = self.personalize_service.delete_solution(
                solutionArn = solution_arn
            )

            return delete_solution_response
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            log.info('Solution does not exist')

    def wait_delete_solution(self, solution_arn, wait_duration = 20, sleep_duration = 900):
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            try:
                describe_solution_response = self.personalize_service.describe_solution(
                    solutionArn = solution_arn
                )
                status = describe_solution_response["solution"]["status"]
                log.info("Solution: {}".format(status))

                time.sleep(sleep_duration)
            except self.personalize_service.exceptions.ResourceNotFoundException as error:
                log.info('DELETED')
                break

    def create_solution_version(self, solution_arn, trainingMode = 'FULL'):
        create_solution_version_response = self.personalize_service.create_solution_version(
            solutionArn = solution_arn,
            trainingMode = trainingMode
        )

        return create_solution_version_response['solutionVersionArn']

    def wait_solution_version(self, solution_version_arn, wait_duration = 10, sleep_duration = 180):
        status = None
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            describe_solution_version_response = self.personalize_service.describe_solution_version(
                solutionVersionArn = solution_version_arn
            )
            status = describe_solution_version_response["solutionVersion"]["status"]
            log.info("SolutionVersion: {}".format(status))

            if status == "CREATE FAILED":
                log.info(describe_solution_version_response['solutionVersion']['failureReason'])
                break
            
            if status == "ACTIVE":
                break
                
            time.sleep(sleep_duration)

        return status

    def update_campaign(self, campaign_arn, solution_version_arn):
        response = self.personalize_service.update_campaign(
            campaignArn=campaign_arn,
            solutionVersionArn=solution_version_arn
        )

    def create_campaign(self, campaign_name, solution_version_arn, campaign_config = {"updateConfig": { "mode": "MANUAL" }}):
        create_campaign_response = self.personalize_service.create_campaign(
            name = campaign_name,
            solutionVersionArn = solution_version_arn,
            minProvisionedTPS = 1,
            campaignConfig = campaign_config
        )

        log.info(create_campaign_response)
        return create_campaign_response['campaignArn']

    def wait_campaign(self, campaign_arn, wait_duration = 10, sleep_duration = 180):
        status = None
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            describe_campaign_response = self.personalize_service.describe_campaign(
                campaignArn = campaign_arn
            )
            status = describe_campaign_response["campaign"]["status"]
            log.info("Campaign: {}".format(status))

            if status == "CREATE FAILED":
                log.info(describe_campaign_response['campaign']['failureReason'])
                break
            
            if status == "ACTIVE":
                break
                
            time.sleep(sleep_duration)

        return status

    def delete_campaign(self, campaign_arn):
        try:
            delete_campaign_response = self.personalize_service.delete_campaign(
                campaignArn = campaign_arn  
            )

            return delete_campaign_response
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            log.info('Campaign does not exist')

    def wait_delete_campaign(self, campaign_arn, wait_duration = 10, sleep_duration = 60):
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            try:
                describe_campaign_response = self.personalize_service.describe_campaign(
                    campaignArn = campaign_arn
                )
                status = describe_campaign_response["campaign"]["status"]
                log.info("Campaign: {}".format(status))

                time.sleep(sleep_duration)
            except self.personalize_service.exceptions.ResourceNotFoundException as error:
                log.info('DELETED')
                break

    def create_event_tracker(self, name, dataset_group_arn):
        create_event_tracker_response = self.personalize_service.create_event_tracker(
            name = name,
            datasetGroupArn = dataset_group_arn
        )

        log.info(create_event_tracker_response)

    def create_filter(self, name, dataset_group_arn, filter_expression):
        create_filter_response = self.personalize_service.create_filter(
            name = name,
            datasetGroupArn = dataset_group_arn,
            filterExpression = filter_expression
        )

        log.info(create_filter_response)

    def delete_filter(self, filter_arn):
        try:
            delete_filter_response = self.personalize_service.delete_filter(
                filterArn = filter_arn
            )
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            log.info('Filter does not exist')

    def wait_delete_filter(self, filter_arn, wait_duration = 5, sleep_duration = 60):
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            try:
                describe_campaign_response = self.personalize_service.describe_filter(
                    filterArn = filter_arn
                )
                status = describe_campaign_response["filter"]["status"]
                log.info("Filter: {}".format(status))

                time.sleep(sleep_duration)
            except self.personalize_service.exceptions.ResourceNotFoundException as error:
                log.info('DELETED')
                break

    def get_filters(self, dataset_group_arn):
        list_filters_response = self.personalize_service.list_filters(
            datasetGroupArn = dataset_group_arn
        )

        return list_filters_response['Filters']

    def create_import_job(self, name, dataset_arn, role_arn, data_location):
        import_job_response = self.personalize_service.create_dataset_import_job(
            jobName = name,
            datasetArn = dataset_arn,
            dataSource = {
                "dataLocation": data_location
            },
            roleArn = role_arn
        )

        import_job_arn = import_job_response['datasetImportJobArn']
        return import_job_arn

    def wait_import_job(self, import_job_arn, wait_duration = 10, sleep_duration = 60):
        status = None
        max_time = time.time() + (wait_duration * 60)
        while time.time() < max_time:
            describe_users_import_job_response = self.personalize_service.describe_dataset_import_job(
                datasetImportJobArn = import_job_arn
            )
            
            users_import_job = describe_users_import_job_response["datasetImportJob"]
            if "latestDatasetImportJobRun" not in users_import_job:
                status = users_import_job["status"]
                log.info("DatasetImportJob: {}".format(status))
            else:
                status = users_import_job["latestDatasetImportJobRun"]["status"]
                log.info("LatestDatasetImportJobRun: {}".format(status))

            if status == "CREATE FAILED":
                log.info(users_import_job['latestDatasetImportJobRun']['failureReason'])
                break
            
            if status == "ACTIVE":
                break
                
            time.sleep(sleep_duration)
        
        return status
    
    def get_schema(self, dataset_arn):
        describe_dataset_resp = self.personalize_service.describe_dataset(
            datasetArn = dataset_arn
        )

        describe_schema_resp = self.personalize_service.describe_schema(
            schemaArn = describe_dataset_resp['dataset']['schemaArn']
        )
        schema_json = json.loads(describe_schema_resp['schema']['schema'])

        return schema_json['fields']

    def get_event_trackers(self, solution_arn):
        try:
            solution_desc = self.personalize_service.describe_solution(
                solutionArn = solution_arn
            )

            eventTrackers = self.personalize_service.list_event_trackers(
                datasetGroupArn = solution_desc['solution']['datasetGroupArn']
            )

            return eventTrackers['eventTrackers']
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            return []

    def get_event_tracker(self, solution_arn):
        solution_desc = self.personalize_service.describe_solution(
            solutionArn = solution_arn
        )

        eventTrackers = self.personalize_service.list_event_trackers(
            datasetGroupArn = solution_desc['solution']['datasetGroupArn']
        )

        event_tracker = self.personalize_service.describe_event_tracker(
            eventTrackerArn = eventTrackers['eventTrackers'][0]['eventTrackerArn']
        )

        return event_tracker['eventTracker']

    def delete_event_tracker(self, event_tracker_arn):
        try:
            self.personalize_service.delete_event_tracker(
                eventTrackerArn = event_tracker_arn
            )
        except self.personalize_service.exceptions.ResourceNotFoundException as error:
            log.info('EventTracker does not exist')

    def add_interaction(self, solution_arn, session_id, user_id, event_ist):
        tracking_id = self.get_event_tracker(solution_arn)['trackingId']

        put_event_response = self.personalize_events_client.put_events(
            trackingId = tracking_id,
            userId = user_id,
            sessionId = session_id,
            eventList = event_ist
        )

        return put_event_response['ResponseMetadata']['HTTPStatusCode'] == 200

    def put_items(self, dataset_arn, items):
        self.personalize_events_client.put_items(
            datasetArn = dataset_arn,
            items = items
        )

    def get_campaigns(self, solution_arn):
        list_campaign_response = self.personalize_service.list_campaigns(
            solutionArn = solution_arn
        )
        return list_campaign_response['campaigns']

    def get_filters(self, dataset_group_arn):
        list_filters_response = self.personalize_service.list_filters(
            datasetGroupArn = dataset_group_arn
        )
        return list_filters_response['Filters']

    def get_recommendations(self, solution_arn, dataset_group_arn, user_id, context, count, filter_arn=None, filter_values=None):
        campaigns = self.get_campaigns(solution_arn)
        active_campaigns = [campaign for campaign in campaigns if campaign['status'] == 'ACTIVE']
        active_campaign_arn = active_campaigns[-1]['campaignArn']

        if filter_arn is not None:
            log.info("filter applied: %s" % filter_arn)
            get_recommendations_response = self.personalize_runtime.get_recommendations(
                campaignArn = active_campaign_arn,
                filterArn = filter_arn,
                filterValues = filter_values,
                userId = user_id,
                context = context,
                numResults = count
            )

            return get_recommendations_response['itemList']

        log.info('No filters applied')
        get_recommendations_response = self.personalize_runtime.get_recommendations(
            campaignArn = active_campaign_arn,
            userId = user_id,
            numResults = count,
        )

        return get_recommendations_response['itemList']
