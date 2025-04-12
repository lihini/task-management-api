process.env = {
  ...process.env,
  AWS_ACCESS_KEY_ID: 'test',
  AWS_SECRET_ACCESS_KEY: 'test',
  AWS_REGION: 'us-east-1',
  S3_BUCKET_NAME: 'test-bucket',
  DYNAMODB_TABLE_NAME: 'test-table',
};