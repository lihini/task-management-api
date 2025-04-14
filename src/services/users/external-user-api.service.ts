import axios, { AxiosInstance } from 'axios';
import { config } from '../../config';
import { ExternalUser } from '../../models/user.model';
import { ExternalApiError } from '../../utils/errors.util';

/**
 * Service for interacting with an external API.
 */
export class ExternalUserApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.userApi.baseUrl,
      timeout: 5000,
    });
  }

  /**
   * Fetch users from external API
   */
  async fetchUsers() {
    try {
      const response = await this.client.get<ExternalUser[]>('/users');
      return response.data;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? `Failed to fetch users: ${error.message}`
        : `Unexpected error: ${(error as Error).message}`;
      throw new ExternalApiError(message);
    }
  }
}