import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', metadata?: Record<string, unknown>) {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODE.FORBIDDEN, { metadata });
  }
}