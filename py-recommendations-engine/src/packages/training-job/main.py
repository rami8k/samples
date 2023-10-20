from newrelic import agent
import os
from datetime import datetime
import logging

from services.Personalize import Personalize
from services.Bwrite import Bwrite

logging.basicConfig(level = logging.INFO)
log = logging.getLogger(__name__)

def create_solution_version(event, context):
    log.info('Started coldstart solution version creation')

    personalize_client = Personalize()
    coldstart_solution_version_arn = personalize_client.create_solution_version(event["PERSONALIZE_SOLUTION_ARN"], "FULL")
    personalize_client.wait_solution_version(coldstart_solution_version_arn)

    log.info('Finished coldstart solution version creation')
    return { 
        'solution_version_arn': coldstart_solution_version_arn
    }

def wait_solution_version(event, context):
    log.info('Started waiting solution version creation')

    personalize_client = Personalize()
    wait_solution_version_status = personalize_client.wait_solution_version(event['solution_version_arn'])

    log.info('Finished waiting solution version creation: {} status: {}'.format(datetime.utcnow().isoformat(), wait_solution_version_status))
    return { 
        'status': wait_solution_version_status,
        'solution_version_arn': event['solution_version_arn']
    }

def update_campaign(event, context):
    log.info('Started campaign update')
    
    personalize_client = Personalize()

    campaigns = personalize_client.get_campaigns(event["PERSONALIZE_SOLUTION_ARN"])
    campaign_arn = personalize_client.update_campaign(campaigns[0]['campaignArn'], event['solution_version_arn'])

def create_campaign(event, context):
    log.info('Started campaign creation')
    campain_name = 'BU-' + datetime.today().strftime('%m-%d-%y-%H%M')
    
    personalize_client = Personalize()
    campaign_arn = personalize_client.create_campaign(
        campain_name,
        event['solution_version_arn'],
        {
            "itemExplorationConfig": {"explorationWeight": "0.7", "explorationItemAgeCutOff": "1"}
        }
    )

    return {
        'campaign_arn': campaign_arn
    }

def wait_campaign(event, context):
    log.info('Started waiting campaign creation')

    personalize_client = Personalize()
    wait_campaign_status = personalize_client.wait_campaign(event['campaign_arn'])

    log.info('Finished waiting campaign creation: {} status: {}'.format(datetime.utcnow().isoformat(), wait_campaign_status))
    return { 
        'status': wait_campaign_status,
        'campaign_arn': event['campaign_arn']
    }

def delete_old_campaigns(event, context):
    log.info('Started old campaign deletion')
    
    personalize_client = Personalize()
    campaigns = personalize_client.get_campaigns(event["PERSONALIZE_SOLUTION_ARN"])

    campaigns_to_delete = [campaign for campaign in campaigns if campaign['campaignArn'] != event['campaign_arn']]

    for campaign in campaigns_to_delete:
        log.info('deleting campaign: %s' % campaign['campaignArn'])
        personalize_client.delete_campaign(campaign['campaignArn'])

# list of tasks required to train a new solution and update related resources
tasks = {
    'create_solution_version': create_solution_version,
    'wait_solution_version': wait_solution_version,
    'update_campaign': update_campaign,
    'create_campaign': create_campaign,
    'wait_campaign': wait_campaign,
    'delete_old_campaigns': delete_old_campaigns
}

# generic handler used in a Step Function to re-train the solution on a daily basis
def handler(event, context):
    print(event)
    processor = tasks.get(event['TASK_NAME'], None)

    if not processor:
        print("invalid function name:", event['TASK_NAME'])
        return

    return processor(event, context)