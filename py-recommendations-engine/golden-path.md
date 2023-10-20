# BU-recommendations Golden Path

## Overview

This is a technical overview of our journey in utilizing AWS Personalize and developing the services needed around it to serve article recommendations to our customers based on their historical interactions and items metadata.


## Prerequisites

* Figuring out what will you recommend, in our case its BU articles so we have to recommend new articles as they come in. This will play a role in choosing the recipe for AWS Personalize.

* Reading AWS Personalize documentation about different recipe types and what they offer and which one is most suitable for the use case.
For our case we needed a recipe that will recommend not only relative items but most importantly recent items, and it allows newly added articles with no interactions what so ever to be suggested to customers so we choose `aws-user-personalization`
https://docs.aws.amazon.com/personalize/latest/dg/working-with-predefined-recipes.html

* Reading about AWS Personalize dataset https://docs.aws.amazon.com/personalize/latest/dg/how-it-works-dataset-schema.html

* Reading about AWS Personalize solution hyperparameters https://docs.aws.amazon.com/personalize/latest/dg/customizing-solution-config-hpo.html

* AWS permissions: please make sure your AWS role has `AmazonPersonalizeFullAccess` policy attached, this will allow the role user to create and manage all AWS Personalize resource.

## Playground

We created a jupyter notebook that anybody can use to create and train an AWS Personalize solution and test it out, it includes:
* Authentication with saml2aws
* Define and create datasets and schemas
* Solution configuration, choosing a recipe, create and train a solution
* Create a campaign for the solution and test the recommendations for a user id

## AWS Personalize

AWS Personalize is an out of the box recommendations service with some customization available like choosing a recipe, configuring hyperparameters, filtering recommended results.

The service ingests 3 types of datasets:
* Items: the items you want to recommend, in our case its BU articles. Our Items dataset was constructed of article metadata (ItemId, Channels, Topics, PostedDate)

* Interactions: the user historical interactions with the Items (views, clicks ...etc). Interactions is the most important dataset as you can build a solution with only interactions as it consists of at least (ItemId, UserId), for our interactions dataset we used (UserId, ItemId, TimeStamp, EventType, EventValue)

* Users: User persona metadata, like (Job Type, Job Title ...etc)

## Problems

We encountered multiple issues while exploring AWS Personalize, most important to mention and anybody to be aware of:

* Cold Start problem: we had an issue that most recently added items are not recommended mainly because they didn't have interactions, we started with `HRNN-Coldstart` recipe, then we switched to `aws-user-personalization` and included `CREATION_TIMESTAMP` attribute in the items dataset to make the solution aware of the article posted date, we also used a campaign with `explorationItemAgeCutOff=1` to recommend most recent items and `explorationWeight=0.7` to provide customers with potential articles that are not under their direct focus.

* HPO: we started training every solution with HPO on, the training time was taking up to 5 hours mostly for the model to figure out the optimal parameters. This was expensive and time consuming, what we decided is for the upcoming solutions we will use the same HPO parameters we got out of the first run as our datasets didn't change in terms of data or attributes much and the original HPO's should be good enough.

* Metrics and A/B testing: When we started exploring our recommendations results and looking at the scores we noticed we had very low scores, with a call with AWS support they mentioned that these scores are not straight forward to read and it lacked documentation and they suggested to the best way to measure the results is to A/B test the results and measure customer engagement. We setup adobe analytics to measured our customers engagemnt against the recommended articles and we found that our customres havee %50 more interest in the recommneded list vs the curated list which was a big success.
To read more about metrics:
https://docs.aws.amazon.com/personalize/latest/dg/working-with-training-metrics.html
https://docs.aws.amazon.com/personalize/latest/dg/getting-real-time-recommendations.html

Filtering: At the start we had to add business logic filtering in our recommendations API code base. AWS team recently added filters to allow business rules filtering on the recommended list, though its not mature enough it allows filtering on the campaign level and keep our code cleaner.

Solution Updates: In one of our meeting with AWS team they suggested that we keep the model updated by running scheduled updates, we had to create a solution in AWS to using AWS Step Functions to run an updtate with `MODE=UPDATE` on the solution every 2 hours, AWS recently added this as a default feature and made it free.

## Our Solution

### Datasets
#### **Items:**
```
{
"type": "record",
"name": "Items",
"namespace": "com.amazonaws.personalize.schema",
"fields": [
{
"name": "ITEM_ID",
"type": "string"
},
{
"name": "CREATION_TIMESTAMP",
"type": "long"
},
{
"name": "TYPE",
"type": "string",
"categorical": true
},
{
"name": "TOPICS",
"type": "string",
"categorical": true
},
{
"name": "CHANNELS",
"type": "string",
"categorical": true
}
],
"version": "1.0"
}
```

The attribute `CREATION_TIMESTAMP` is important to recommend most recent added items.

A categorical attribute can contain multiple values separated by a pipe `|` and the size limit is 1000 characters and if you have more than that you have to normalize it by using some sort of unified key/id.
An Example of a categorical field for BU article is channels as an article can span multiple channels:
```
CHANNELS: "ATNW|BNNW|BKNW"
```

Also make sure not use a manual textual entry for categorical attribute, ex: customer typing their job type. As its not normalized to a defined set of values it will not make your solution perform any better.

#### **User-item interaction:**
```
{
"type": "record",
"name": "Interactions",
"namespace": "com.amazonaws.personalize.schema",
"fields": [
{
"name": "USER_ID",
"type": "string"
},
{
"name": "ITEM_ID",
"type": "string"
},
{
"name": "TIMESTAMP",
"type": "long"
},
{
"name": "EVENT_TYPE",
"type": "string"
},
{
"name": "EVENT_VALUE",
"type": "float"
}
],
"version": "1.0"
}
```
EVENT_TYPE is user engagement with items(BU articles), for example click, view, reed
EVENT_VALUE is a measurement of the engagement, for example click/view can be 1 and for read is how much the customer read of the story and can be a formula involving scroll percentage and view time

#### **User:**
we didn't use user dataset as the users data we had consisted of USER_ID, STATE, JOB_TYPE, JOB_TITLE.
JOB_TYPE and JOB_TITLE were textual manual entry by customers and were not normalized and were missing for a large subset of customers so we opted not to use the users data we had. We tried training a solution using it but it didn't make any deffirence.

### Solution:
* Recipe: we used `aws-user-personalization` as its most suitable for BU articles, it enables us to recommend recent articles and enable exploration for newly posted articles.
The solution will update itself every 2 hours(free) to include newly added items and interactions.

* Solution configuration and HPO: for the first run we performed HPO(expensive) to get the best results which this will figure out the optimal hyperparameters for the solution, and for new solutions we used the same hyperparameteres were produced from the first run.

* Other configuration(related to the recipe):
```
{
"performExploration": true,
"featureTransformationParameters": {
"cold_start_max_duration": "1",
"cold_start_max_interactions": "15",
"cold_start_relative_from": "currentTime",
"max_hist_length_percentile": "0.99",
"min_hist_length_percentile": "0.01"
}
}
```

### Campaign
These configuration are related to the recipe we used `aws-user-personalization` https://docs.aws.amazon.com/personalize/latest/dg/native-recipe-new-item-USER_PERSONALIZATION.html
* Exploration weight: 0.7 (to allow newly posted articles to be recommended even if they don't match user profile).
* Exploration item age cut off: 1 (to recommend articles based on current timestamp, most recent)

### Event Tracker
Standard event tracker to feed new interactions to the interactions dataset.

## Our Services
We built and API service and bunch of AWS services around AWS Personalize to have more control and it consists of the following:
* Scheduled feed: a scheduled AWS Lambda to feed newly posted articles to the Items dataset.

* Scheduled Full Training: As AWS team recommended we have to do full training periodically and because we are dealing with BU articles and they have to be recent all the time we scheduled a daily full training using Step Functions and Lambdas. This is relatively costly and take up to 4 hours to finish so we scheduled it once a day at mid night.

* API services: We used API Gateway and Lambdas to expose interactions and recommendations endpoints
* interactions endpoint: is called every time a user visits or interacts with an article to feed the interactions details to the interactions dataset. This will allow the solution to instaniously recommend new articles.
https://docs.aws.amazon.com/personalize/latest/dg/recording-events.html

* recommendations endpoint: provide recommended articles based on user id and filter criteria.
https://docs.aws.amazon.com/personalize/latest/dg/getting-real-time-recommendations.html

* Tasks (Fargate): As we have read only access in our AWS production account we had to create the solution(AWS Personalize) with an automated task that will create datasets, schemas, import jobs, solution, campaign, event tracker and filters. To be able to do that we created a docker container that runs in fargate and executes all the steps in sequence. As well as other tasks to prepare data files for datasets, create and delete solutions, filters and campaigns.


License
----