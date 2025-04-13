import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { logger } from '../utils/logger.util';
import { S3Error } from '../utils/errors.util';

  
/**
   * Generic service for AWS S3 operations.
   */
export class S3Service {
  private client: S3Client;

  private bucketName: string;
  
  constructor() {
    this.client = new S3Client({
      region: config.aws.region,
      credentials: config.aws.credentials,
    });
    this.bucketName = config.aws.s3Bucket;
  }
  
  /**
     * Generates a pre-signed URL for uploading a file to S3.
     * @param key - The S3 object key (e.g., taskId/filename).
     * @param expiresIn - URL expiration time in seconds (default: 1 hour).
     * @returns Pre-signed URL for upload.
     * @throws {S3Error} If the operation fails.
     */
  async generateUploadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const url = await getSignedUrl(this.client, command, { expiresIn });
      logger.info(`Generated pre-signed URL for key: ${key}`);
      return url;
    } catch (error) {
      logger.error(`Failed to generate pre-signed URL for ${key}: ${error}`);
      throw new S3Error(`Failed to generate upload URL: ${(error as Error).message}`);
    }
  }
  
  /**
     * Deletes a file from S3.
     * @param key - The S3 object key.
     * @throws {S3Error} If the operation fails.
     */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      logger.info(`Deleted file from S3: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete file ${key}: ${error}`);
      throw new S3Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }
  
  /**
     * Generates a permanent S3 URL for a file.
     * @param key - The S3 object key.
     * @returns Permanent S3 URL.
     */
  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }
}