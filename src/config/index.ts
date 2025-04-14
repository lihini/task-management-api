import dotenv from 'dotenv';

dotenv.config({
  path: ['.env.local', '.env.prod'],
});

export const config = {
  aws: {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET_NAME || 'task-mgmt-api-attachments',
    tables: {
      tasks: process.env.DYNAMODB_TASKS_TABLE_NAME,
      cache: process.env.DYNAMODB_CACHE_TABLE_NAME || 'cache',
    },
  },
  userApi: {
    baseUrl: process.env.EXTERNAL_API_URL || 'https://jsonplaceholder.typicode.com',
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10), // 5 minutes
  },
  port: process.env.PORT || 3000,
};