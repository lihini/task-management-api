import request from 'supertest';
import express from 'express';
import { UserController } from '../../src/controllers/users.controller';
import { UserService } from '../../src/services/users';
import { errorHandler } from '../../src/middlewares/error.middleware';
import { ExternalApiError } from '../../src/utils/errors.util';

jest.mock('../../src/services/users');

const mockUserService = UserService as jest.MockedClass<typeof UserService>;

describe('UserController', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    const controller = new UserController();
    app.get('/users', controller.getUsers);
    app.use(errorHandler);
    mockUserService.prototype.getUsers.mockReset();
  });

  describe('GET /users', () => {
    const mockUsers = [
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

    it('should return users from external API', async () => {
      mockUserService.prototype.getUsers.mockResolvedValue(mockUsers);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ users: mockUsers });
    });

    it('should handle external API errors', async () => {
      mockUserService.prototype.getUsers.mockRejectedValue(
        new ExternalApiError('Failed to fetch users: Network error'),
      );

      const response = await request(app).get('/users');

      expect(response.status).toBe(502);
      expect(response.body.message).toContain('External API error');
    });
  });
});