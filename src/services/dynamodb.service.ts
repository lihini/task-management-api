import {
  DynamoDBClient,
  ResourceNotFoundException,
  ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { config } from '../config';
import { logger } from '../utils/logger.util';
import { DynamoDBError } from '../utils/errors.util';

/**
 * Generic service for DynamoDB operations.
 */
export class DynamoDBService {
  private client: DynamoDBClient;

  private docClient: DynamoDBDocumentClient;
  
  constructor() {
    this.client = new DynamoDBClient({
      region: config.aws.region,
      credentials: config.aws.credentials,
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }
  
  /**
     * Creates or updates an item in the specified DynamoDB table.
     * @param tableName - The name of the DynamoDB table.
     * @param item - The item to store.
     * @throws {DynamoDBError} If the operation fails.
     */
  async putItem<T extends Record<string, any>>(tableName: string, item: T): Promise<T> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
        }),
      );
      logger.info(`Stored item in table ${tableName}`);
      return item;
    } catch (error) {
      logger.error(`Failed to put item in ${tableName}: ${error}`);
      if (error instanceof ResourceNotFoundException) {
        throw new DynamoDBError(`Table ${tableName} not found`, 'TableNotFound');
      }
      throw new DynamoDBError(`Failed to put item: ${(error as Error).message}`);
    }
  }
  
  /**
     * Retrieves an item by its key from the specified DynamoDB table.
     * @param tableName - The name of the DynamoDB table.
     * @param key - The primary key of the item.
     * @throws {DynamoDBError} If the operation fails.
     */
  async getItem<T>(tableName: string, key: Record<string, any>): Promise<T | null> {
    try {
      const result = await this.docClient.send(
        new GetCommand({
          TableName: tableName,
          Key: key,
        }),
      );
      if (!result.Item) {
        logger.warn(`Item not found in table ${tableName} with key ${JSON.stringify(key)}`);
        return null;
      }
      return result.Item as T;
    } catch (error) {
      logger.error(`Failed to get item from ${tableName}: ${error}`);
      if (error instanceof ResourceNotFoundException) {
        throw new DynamoDBError(`Table ${tableName} not found`, 'TableNotFound');
      }
      throw new DynamoDBError(`Failed to get item: ${(error as Error).message}`);
    }
  }
  
  /**
     * Retrieves all items from the specified DynamoDB table.
     * @param tableName - The name of the DynamoDB table.
     * @throws {DynamoDBError} If the operation fails.
     */
  async scanItems<T>(tableName: string): Promise<T[]> {
    try {
      const result = await this.docClient.send(
        new ScanCommand({
          TableName: tableName,
        }),
      );
      return (result.Items as T[]) || [];
    } catch (error) {
      logger.error(`Failed to scan items in ${tableName}: ${error}`);
      if (error instanceof ResourceNotFoundException) {
        throw new DynamoDBError(`Table ${tableName} not found`, 'TableNotFound');
      }
      throw new DynamoDBError(`Failed to scan items: ${(error as Error).message}`);
    }
  }
  
  /**
     * Updates an item in the specified DynamoDB table.
     * @param tableName - The name of the DynamoDB table.
     * @param key - The primary key of the item.
     * @param updates - The attributes to update.
     * @param updateExpression - The update expression for DynamoDB.
     * @param expressionAttributeNames -  Attribute names for the update expression.
     * @param expressionAttributeValues - Values for the update expression.
     * @throws {DynamoDBError} If the operation fails.
     */
  async updateItem<T>(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeNames: Record<string, any>,
    expressionAttributeValues: Record<string, any>,
  ): Promise<T | null> {
    try {
      const result = await this.docClient.send(
        new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ConditionExpression: 'attribute_exists(id)',
          ReturnValues: 'ALL_NEW',
        }),
      );
      logger.info(`Updated item in table ${tableName}`);
      return result.Attributes as T;
    } catch (error) {
      logger.error(`Failed to update item in ${tableName}: ${error}`);
      if (error instanceof ConditionalCheckFailedException) {
        return null;
      }
      if (error instanceof ResourceNotFoundException) {
        throw new DynamoDBError(`Table ${tableName} not found`, 'TableNotFound');
      }
      throw new DynamoDBError(`Failed to update item: ${(error as Error).message}`);
    }
  }
  
  /**
     * Deletes an item by its key from the specified DynamoDB table.
     * @param tableName - The name of the DynamoDB table.
     * @param key - The primary key of the item.
     * @throws {DynamoDBError} If the operation fails.
     */
  async deleteItem(tableName: string, key: Record<string, any>): Promise<boolean> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: key,
          ConditionExpression: 'attribute_exists(id)',
        }),
      );
      logger.info(`Deleted item from table ${tableName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete item from ${tableName}: ${error}`);
      if (error instanceof ConditionalCheckFailedException) {
        return false;
      }
      if (error instanceof ResourceNotFoundException) {
        throw new DynamoDBError(`Table ${tableName} not found`, 'TableNotFound');
      }
      throw new DynamoDBError(`Failed to delete item: ${(error as Error).message}`);
    }
  }
}