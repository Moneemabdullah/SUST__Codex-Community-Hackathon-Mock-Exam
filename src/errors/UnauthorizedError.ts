import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', metadata?: Record<string, unknown>) {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED, { metadata });
  }
}