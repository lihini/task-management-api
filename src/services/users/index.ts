import { DynamoDBService } from '../dynamodb.service';
import { logger } from '../../utils/logger.util';
import { ExternalUser } from '../../models/user.model';
import { config } from '../../config';
import { ExternalUserApiService } from './external-user-api.service';

export class UserService {
  private api: ExternalUserApiService;

  private db: DynamoDBService;
  
  private cacheKey = 'jsonplaceholder:users';

  constructor() {
    this.api = new ExternalUserApiService();
    this.db = new DynamoDBService();
  }

  /**
   * Fetches users from JSONPlaceholder with caching.
   * @returns Array of users.
   * @throws {ExternalApiError} If the API call fails.
   */
  async getUsers(): Promise<ExternalUser[]> {
    // Check cache first
    const cachedUsers = await this.db.getCachedData<ExternalUser[]>(config.aws.tables.cache, this.cacheKey);
    if (cachedUsers) {
      logger.info('Returning cached users');
      return cachedUsers;
    }

    // Fetch from external API
    const users = await this.api.fetchUsers();

    // Cache the response
    await this.db.cacheData(config.aws.tables.cache, this.cacheKey, users, config.userApi.cacheTtlSeconds);
    logger.info('Fetched and cached users from external API');

    return users;
  }
}