import { ValidationError } from 'express-validator';

export interface GenericErrorResponse {
  status: number;       // HTTP response code
  error: {
    message: string;  // human readable message
    type: string;     // error category
    code: number;     // application specific error code
  }
}

export interface ValidationErrorResponse {
  status: number;
  message: string;
  type: string;
  errors: ValidationError[];
}