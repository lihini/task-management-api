import { DynamoDBService } from '../../../src/services/dynamodb.service';
import { UserService } from '../../../src/services/users';
import { ExternalUser } from '../../../src/models/user.model';
import { ExternalUserApiService } from '../../../src/services/users/external-user-api.service';

jest.mock('../../../src/services/dynamodb.service');
jest.mock('../../../src/services/users/external-user-api.service');
jest.mock('../../../src/config', () => ({
  config: {
    userApi: {
      baseUrl: 'https://jsonplaceholder.typicode.com',
      cacheTtlSeconds: 300,
    },
    aws: {
      tables: { cache: 'test-cache' },
    },
  },
}));

const mockDynamoDBService = DynamoDBService as jest.MockedClass<typeof DynamoDBService>;
const mockApiService = ExternalUserApiService as jest.MockedClass<typeof ExternalUserApiService>;

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    mockDynamoDBService.prototype.getCachedData.mockReset();
    mockDynamoDBService.prototype.cacheData.mockReset();
    mockApiService.prototype.fetchUsers.mockReset();
  });

  describe('getUsers', () => {
    const mockUsers: ExternalUser[] = [
      {
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        address: {
          street: 'Kulas Light',
          suite: 'Apt. 556',
          city: 'Gwenborough',
          zipcode: '92998-3874',
          geo: { lat: '-37.3159', lng: '81.1496' },
        },
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
        company: {
          name: 'Romaguera-Crona',
          catchPhrase: 'Multi-layered client-server neural-net',
          bs: 'harness real-time e-markets',
        },
      },
    ];

    it('should return cached users if available', async () => {
      mockDynamoDBService.prototype.getCachedData.mockResolvedValue(mockUsers);

      const users = await service.getUsers();

      expect(mockDynamoDBService.prototype.getCachedData).toHaveBeenCalledWith('test-cache', 'jsonplaceholder:users');
      expect(mockApiService.prototype.fetchUsers).not.toHaveBeenCalled();
      expect(users).toEqual(mockUsers);
    });

    it('should fetch users from API and cache them if not cached', async () => {
      mockDynamoDBService.prototype.getCachedData.mockResolvedValue(null);
      mockApiService.prototype.fetchUsers.mockResolvedValue(mockUsers);

      const users = await service.getUsers();

      expect(mockDynamoDBService.prototype.cacheData).toHaveBeenCalledWith(
        'test-cache',
        'jsonplaceholder:users',
        mockUsers,
        300,
      );
      expect(users).toEqual(mockUsers);
    });
  });
});