import * as AWSType from "aws-sdk"
import { captureAWS } from "aws-xray-sdk-core"
import { UserHistory, ArticleViews } from "@org/app-views-data-adapter"
import { groupByPropType, reGuidify } from '../utils'

const aws = captureAWS(AWSType)
const connectionParams = { region: process.env.AWS_REGION }

export class ViewsService {
  healthcheck(): object {
    return {
      status: 200
    }
  }

  async addUserHistory(userId: string, channelId: string, articleId: string) {
    const dynamoDbClient: AWSType.DynamoDB = new aws.DynamoDB(connectionParams)

    const currentTimestamp = Math.floor(new Date().getTime() / 1000)
    const ttl = currentTimestamp + 604800

    const params: AWSType.DynamoDB.PutItemInput = {
      TableName : "app.UserHistory",
      Item: {
        'UserId' : { N: userId },
        'ChannelId' : { S: channelId },
        'ArticleId' : { S: reGuidify(articleId) },
        'ViewDate' : { N: Math.floor(Date.now() / 1000).toString() },
        'TTL': { N: ttl.toString() }
      }
    }

    const userHistory = new UserHistory(dynamoDbClient)
    const result = await userHistory.putItem(params)
    return result
  }

  async getUserHistory(userId: string, viewDate: string) {
    const dynamoDbClient: AWSType.DynamoDB = new aws.DynamoDB(connectionParams)

    const params: AWSType.DynamoDB.QueryInput = {
      TableName : "app.UserHistory",
      KeyConditionExpression: 'UserId = :userId AND ViewDate > :viewDate',
      ExpressionAttributeValues: {
        ':userId': { N: userId },
        ':viewDate': { N: viewDate }
      },
      ProjectionExpression: "ArticleId, ViewDate",
      ScanIndexForward: false
    }

    const userHistory = new UserHistory(dynamoDbClient)

    const queryResult = await userHistory.query(params).then(data => {
      return data
    })

    return queryResult.map(x => x.ArticleId.S)
  }

  async getChannelViews(channelId: string, count: number) {
    const dynamoDbClient: AWSType.DynamoDB = new aws.DynamoDB(connectionParams)

    const params: AWSType.DynamoDB.QueryInput = {
      TableName: 'app.ArticleViewsPerMin',
      IndexName: 'Channel-Index',
      KeyConditionExpression: 'ChannelId = :channelId',
      ProjectionExpression: "ArticleId, #count",
      ExpressionAttributeValues: {
        ':channelId': { S : channelId }
      },
      ExpressionAttributeNames: {
        '#count': 'Count'
      }
    }

    const articleViews = new ArticleViews(dynamoDbClient)

    const queryResult = await articleViews.query(params).then(data => {
      return data
    })

    const itemCount = groupByPropType(queryResult, 'ArticleId', 'Count')
    const mostViewed = Object.keys(itemCount).sort(function(a,b){return itemCount[b] -itemCount[a]})
    return mostViewed.slice(0, count)
  }

  async getPopularArticles(count: number) {
    const dynamoDbClient: AWSType.DynamoDB = new aws.DynamoDB(connectionParams)

    const articleViews = new ArticleViews(dynamoDbClient)

    const queryResult = await articleViews.getAll().then(data => {
      return data
    })

    const itemCount = groupByPropType(queryResult, 'ArticleId', 'Count')
    return Object.keys(itemCount)
      .sort(function(a,b){return itemCount[b] -itemCount[a]})
      .slice(0, Math.min(25, count))
  }
}