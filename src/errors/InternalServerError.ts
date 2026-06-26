import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', metadata?: Record<string, unknown>, cause?: unknown) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODE.INTERNAL_ERROR, {
      metadata,
      cause,
      isOperational: false,
    });
  }
}