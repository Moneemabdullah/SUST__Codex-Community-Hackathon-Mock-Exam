import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';

export interface RateLimitErrorOptions {
  retryAfterSeconds?: number;
  metadata?: Record<string, unknown>;
}

export class RateLimitError extends AppError {
  public readonly retryAfterSeconds?: number;

  constructor(message = 'Too many requests', options: RateLimitErrorOptions = {}) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODE.RATE_LIMIT_EXCEEDED, {
      metadata: {
        ...(options.retryAfterSeconds !== undefined ? { retryAfterSeconds: options.retryAfterSeconds } : {}),
        ...(options.metadata ?? {}),
      },
    });
    if (options.retryAfterSeconds !== undefined) {
      this.retryAfterSeconds = options.retryAfterSeconds;
    }
  }
}