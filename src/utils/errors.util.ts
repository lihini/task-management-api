export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Custom error for DynamoDB-related issues.
 */
export class DynamoDBError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DynamoDBError';
  }
}

  
/**
 * Custom error for S3-related issues.
 */
export class S3Error extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'S3Error';
  }
}

/**
 * Custom error for external API issues.
 */
export class ExternalApiError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ExternalApiError';
  }
}