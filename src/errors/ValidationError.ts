import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';

export interface FieldIssue {
  path: string;
  message: string;
  code?: string;
}

export interface ValidationErrorOptions {
  fields: FieldIssue[];
  cause?: unknown;
}

export class ValidationError extends AppError {
  public readonly fields: ReadonlyArray<FieldIssue>;

  constructor(message = 'Validation failed', options: ValidationErrorOptions) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODE.VALIDATION_FAILED, {
      metadata: { fields: options.fields },
      cause: options.cause,
    });
    this.fields = Object.freeze([...options.fields]);
  }
}