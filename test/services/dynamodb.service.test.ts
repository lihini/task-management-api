import { DynamoDBService } from '../../src/services/dynamodb.service';
import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBError } from '../../src/utils/errors.util';
import 'aws-sdk-client-mock-jest';

jest.mock('../../src/config', () => ({
  config: {
    aws: {
      region: 'us-east-1',
      credentials: { accessKeyId: 'mock-key', secretAccessKey: 'mock-secret' },
      tables: { tasks: 'test-tasks', cache: 'test-cache' },
    },
  },
}));

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('DynamoDBService', () => {
  let service: DynamoDBService;

  beforeEach(() => {
    service = new DynamoDBService();
    ddbMock.reset();
  });

  describe('cacheData', () => {
    it('should cache data with TTL', async () => {
      const data = { foo: 'bar' };
      const key = 'test-key';
      const ttlSeconds = 300;
      ddbMock.on(PutCommand).resolves({});

      await service.cacheData('test-cache', key, data, ttlSeconds);

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: 'test-cache',
        Item: expect.objectContaining({
          key: 'test-key',
          data: JSON.stringify(data),
          expiresAt: expect.any(Number),
        }),
      });
    });

    it('should throw DynamoDBError on failure', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB failure'));

      await expect(service.cacheData('test-cache', 'test-key', {}, 300)).rejects.toThrow(
        new DynamoDBError('Failed to cache data: DynamoDB failure'),
      );
    });
  });

  describe('getCachedData', () => {
    it('should return cached data', async () => {
      const data = { foo: 'bar' };
      const now = Math.floor(Date.now() / 1000);
      ddbMock.on(GetCommand).resolves({
        Item: {
          key: 'test-key',
          data: JSON.stringify(data),
          expiresAt: now + 300,
        },
      });

      const result = await service.getCachedData<{ foo: string }>('test-cache', 'test-key');

      expect(result).toEqual(data);
    });

    it('should return null if not cached', async () => {
      ddbMock.on(GetCommand).resolves({});

      const result = await service.getCachedData('test-cache', 'test-key');

      expect(result).toBeNull();
    });

    it('should return null and delete expired data', async () => {
      const data = { foo: 'bar' };
      const now = Math.floor(Date.now() / 1000);
      ddbMock.on(GetCommand).resolves({
        Item: {
          key: 'test-key',
          data: JSON.stringify(data),
          expiresAt: now - 300,
        },
      });
      ddbMock.on(DeleteCommand).resolves({});

      const result = await service.getCachedData('test-cache', 'test-key');

      expect(result).toBeNull();
      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: 'test-cache',
        Key: { key: 'test-key' },
      });
    });

    it('should throw DynamoDBError on failure', async () => {
      ddbMock.on(GetCommand).rejects(new Error('DynamoDB failure'));

      await expect(service.getCachedData('test-cache', 'test-key')).rejects.toThrow(
        new DynamoDBError('Failed to get cached data: DynamoDB failure'),
      );
    });
  });
});