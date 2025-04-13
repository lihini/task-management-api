import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { TaskStatus } from '../models/task.model';
import { ValidationErrorResponse } from '../dtos/error-response.dto';

export const validateTask = [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  body('fileNames').optional().isArray().withMessage('fileNames must be an array'),
  body('fileNames.*').isString().withMessage('Each file name must be a string'),
];

export const validateTaskId = [
  param('id').isUUID().withMessage('Invalid task ID'),
];

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(<ValidationErrorResponse>{
      status: 400,
      message: 'Validation errors found',
      type: 'ValidationError',
      errors: errors.array(),
    });
  }
  next();
};
