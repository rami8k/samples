import { DynamoDB } from 'aws-sdk'
import { ItemList, PutItemOutput, UpdateItemOutput } from 'aws-sdk/clients/dynamodb';
import { IDataAdapter } from './IDataAdapter'

export class DataAdapter implements IDataAdapter {
  tableName: string
  dynamoDbClient: DynamoDB;

  constructor(dynamoDbClient: DynamoDB, tableName: string) { 
    this.dynamoDbClient = dynamoDbClient
    this.tableName = tableName
  }

  async putItem(item: DynamoDB.PutItemInput): Promise<PutItemOutput> {
    item.TableName = this.tableName
    const result = await this.dynamoDbClient.putItem(item, function(err, data) {
      if (err) console.log("Error", err)
    }).promise()

    return result
  }

  async updateItem(item: DynamoDB.UpdateItemInput): Promise<UpdateItemOutput> {
    item.TableName = this.tableName
    const result = await this.dynamoDbClient.updateItem(item, function(err, data) {
      if (err) console.log("Error", err)
    }).promise()
    
    return result
  }

  async query(params: DynamoDB.QueryInput): Promise<ItemList> {
    params.TableName = this.tableName
    const queryResult = await this.dynamoDbClient.query(params).promise()
    return queryResult.Items
  }

  async getAll(): Promise<ItemList> {
    const queryResult = await this.dynamoDbClient.scan({
      TableName: this.tableName
    }).promise()

    return queryResult.Items
  }
}