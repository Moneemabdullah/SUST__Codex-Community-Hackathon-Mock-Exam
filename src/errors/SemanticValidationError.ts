import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';
import type { FieldIssue } from './ValidationError.js';

export interface SemanticValidationErrorOptions {
  fields: FieldIssue[];
  cause?: unknown;
}

/** Semantic input failure (e.g. empty complaint) — HTTP 422. */
export class SemanticValidationError extends AppError {
  public readonly fields: ReadonlyArray<FieldIssue>;

  constructor(message: string, options: SemanticValidationErrorOptions) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODE.VALIDATION_FAILED, {
      metadata: { fields: options.fields },
      cause: options.cause,
    });
    this.fields = Object.freeze([...options.fields]);
  }
}
