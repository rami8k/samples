import { DynamoDB } from "aws-sdk";
import { DataAdapter } from './DataAdapter'

export class ArticleViews extends DataAdapter {
  
  constructor(dynamoDbClient: DynamoDB) { 
    super(dynamoDbClient, "app.ArticleViewsPerMin");
  }

  // async getAll(): Promise<DynamoDB.ItemList> {
  //   const params = {
  //     TableName: this.tableName,
  //     ProjectionExpression: "ArticleId, #count",
  //     ExpressionAttributeNames: {
  //       '#count': 'Count'
  //     }
  //   }
    
  //   const queryResult = await this.dynamoDbClient.query(params).promise()
  //   return queryResult.Items
  // }
}