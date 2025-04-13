import { S3Service } from '../../src/services/s3.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';

jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('../../src/config', () => ({
  config: {
    aws: {
      region: 'us-east-1',
      credentials: { accessKeyId: 'mock-key', secretAccessKey: 'mock-secret' },
      s3Bucket: 'test-bucket',
    },
  },
}));

const s3Mock = mockClient(S3Client);

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(() => {
    service = new S3Service();
    s3Mock.reset();
    (getSignedUrl as jest.Mock).mockReset();
  });

  describe('generateUploadUrl', () => {
    it('should generate a pre-signed URL', async () => {
      const mockUrl = 'https://test-bucket.s3.us-east-1.amazonaws.com/task1/file.pdf?signed';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const url = await service.generateUploadUrl('task1/file.pdf');

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(PutObjectCommand),
        { expiresIn: 3600 },
      );
      expect(url).toBe(mockUrl);
    });

    it('should throw S3Error on failure', async () => {
      const error = new Error('Network failure');
      (getSignedUrl as jest.Mock).mockRejectedValue(error);

      await expect(service.generateUploadUrl('task1/file.pdf')).rejects.toThrow(
        new Error('Failed to generate upload URL: Network failure'),
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file from S3', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});

      await service.deleteFile('task1/file.pdf');

      expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
        Bucket: 'test-bucket',
        Key: 'task1/file.pdf',
      });
    });

    it('should throw S3Error on failure', async () => {
      s3Mock.on(DeleteObjectCommand).rejects(new Error('Access denied'));

      await expect(service.deleteFile('task1/file.pdf')).rejects.toThrow(
        new Error('Failed to delete file: Access denied'),
      );
    });
  });

  describe('getFileUrl', () => {
    it('should return a permanent S3 URL', () => {
      const url = service.getFileUrl('task1/file.pdf');
      expect(url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/task1/file.pdf');
    });
  });
});