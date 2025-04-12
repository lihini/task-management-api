import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../utils/errors.util';
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

  // return all other errors with 500 status code
  res.status(500).json(<GenericErrorResponse>{
    status: 500,
    error: {
      message: err.message || 'Internal Server Error',
      type: 'InternalServerError',
    },
  });
};