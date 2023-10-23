import { DynamoDB } from "aws-sdk";
import { DataAdapter } from './DataAdapter'

export class UserHistory extends DataAdapter { 

  constructor(dynamoDbClient: DynamoDB) { 
    super(dynamoDbClient, "app.UserHistory");
  }

  async getAll(): Promise<DynamoDB.ItemList> {
    const params = {
      TableName: this.tableName,
      ProjectionExpression: "ItemId, #count",
      ExpressionAttributeNames: {
        '#count': 'Count'
      }
    }
    
    const queryResult = await this.dynamoDbClient.query(params).promise()
    return queryResult.Items
  }
}