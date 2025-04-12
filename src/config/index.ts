import dotenv from 'dotenv';

dotenv.config();

export const config = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET_NAME,
    dynamodbTable: process.env.DYNAMODB_TABLE_NAME,
  },
  port: process.env.PORT || 3000,
};