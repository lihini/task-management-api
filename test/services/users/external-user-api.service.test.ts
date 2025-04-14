import axios from 'axios';
import { ExternalUserApiService } from '../../../src/services/users/external-user-api.service';
import { ExternalUser } from '../../../src/models/user.model';

jest.mock('axios');
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

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('ExternalUserApiService', () => {
  let service: ExternalUserApiService;
  const mockClient = { get: jest.fn() };
  mockAxios.create.mockReturnValue(mockClient as any);

  beforeEach(() => {
    service = new ExternalUserApiService();
    mockAxios.get.mockReset();
  });

  describe('fetchUsers', () => {
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

    it('should fetch users from API', async () => {
      mockClient.get.mockResolvedValue({ data: mockUsers });

      const users = await service.fetchUsers();

      expect(mockClient.get).toHaveBeenCalledWith('/users');
      expect(users).toEqual(mockUsers);
    });

    it('should throw ExternalApiError on API failure', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchUsers()).rejects.toThrow(
        new Error('Unexpected error: Network error'),
      );
    });
  });
});
