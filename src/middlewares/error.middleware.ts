import { NextFunction, Request, Response } from 'express';
import { DynamoDBError, ExternalApiError, NotFoundError, S3Error } from '../utils/errors.util';
import { GenericErrorResponse } from '../dtos/error-response.dto';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  logger.error(err.stack);
  
  // return NotFoundErrors with 404 status code
  if (err instanceof NotFoundError) {
    return res.status(404).json(<GenericErrorResponse>{
      status: 404,
      error: {
        message: err.message,
        type: 'NotFoundError',
      },
    });
  }

  if (err instanceof DynamoDBError) {
    // indicate issue is related to DynamoDB
    res.status(500).json({
      message: `DynamoDB error: ${err.message}`,
    });
    return;
  }

  if (err instanceof S3Error) {
    // indicate issue is related to S3
    res.status(500).json({
      message: `S3 error: ${err.message}`,
    });
    return;
  }

  if (err instanceof ExternalApiError) {
    // return 502 to indicate upstream issues
    res.status(502).json({
      message: `External API error: ${err.message}`,
    });
    return;
  }

  // return all other errors with 500 status code
  res.status(500).json(<GenericErrorResponse>{
    status: 500,
    error: {
      message: err.message || 'Internal Server Error',
      type: 'InternalServerError',
    },
  });
};