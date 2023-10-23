import { DynamoDB } from 'aws-sdk'
import { ArticleViews } from '@org/app-views-data-adapter'
import { Bwrite } from './services/Bwrite'

export const handler = async(event, context) => {
  const dynamoDbClient = new DynamoDB({ 
    region: process.env.AWS_REGION
  })

  for (let i = 0; i < event.Records.length; i++) {
    if (event.Records[i].eventName !== 'INSERT') {
      continue
    }

    const newRecord = event.Records[i].dynamodb.NewImage

    const channelId = newRecord.ChannelId.S
    const articleId = newRecord.ArticleId.S

    const bwrite = new Bwrite()
    const article = await bwrite.getArticle(articleId)

    const recencyDays = new Date().getDay() <= 2 ? 3 : 2
    let recencyDate = new Date()
    recencyDate.setDate(recencyDate.getDate() - recencyDays)
    const recencyDateISO = recencyDate.toISOString()

    if (!article || article.postedDate < recencyDateISO) {
      return
    }

    console.log('article.postedDate', article.postedDate)
    console.log('recencyDateISO', recencyDateISO)
    console.log(article.postedDate < recencyDateISO)

    const currentTime = new Date()
    const currentTimestamp = Math.floor(currentTime.getTime() / 1000)
    const ttl = currentTimestamp + 86400
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute
    
    const key = `${channelId}_${articleId}_${currentTotalMinutes}`

    const params: DynamoDB.UpdateItemInput = {
      TableName : "app.ArticleViewsPerMin",
      'Key': {
        'Id': { S: key }
      },
      UpdateExpression: 'SET #count = if_not_exists(#count, :defaultval) + :val, #ttl=:ttl, ChannelId=:channelId, ArticleId=:articleId',
      'ExpressionAttributeNames': {
        '#ttl': 'TTL',
        '#count': 'Count',
      },
      'ExpressionAttributeValues': {
        ':val': { N: '1' },
        ':defaultval': { N: '0'},
        ':ttl': { N: ttl.toString() },
        ':channelId': { S: channelId },
        ':articleId': {S : articleId }
      }
    }

    const articleViews = new ArticleViews(dynamoDbClient)
    const result = await articleViews.updateItem(params)
  }
};