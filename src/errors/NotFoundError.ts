import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', metadata?: Record<string, unknown>) {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND, { metadata });
  }
}