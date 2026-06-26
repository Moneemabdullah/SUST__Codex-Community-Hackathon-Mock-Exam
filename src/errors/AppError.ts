import type { HttpStatusCode } from '../constants/http.constants.js';
import type { ErrorCode } from '../constants/error.constants.js';

/**
 * Base class for every error this app intentionally throws.
 *
 * - `statusCode` drives the HTTP response.
 * - `code` is a stable string the client can switch on.
 * - `isOperational` distinguishes predictable failures from programmer bugs.
 * - `metadata` carries safe, structured context (e.g. field-level validation details).
 * - Stack traces are NEVER serialized to clients; they are logged separately.
 */
export abstract class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly metadata?: Readonly<Record<string, unknown>>;

  protected constructor(
    message: string,
    statusCode: HttpStatusCode,
    code: ErrorCode,
    options: { isOperational?: boolean; metadata?: Record<string, unknown>; cause?: unknown } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options.isOperational ?? true;
    if (options.metadata) {
      this.metadata = Object.freeze({ ...options.metadata });
    }
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
    Error.captureStackTrace?.(this, this.constructor);
  }

  /** Safe JSON representation — never leaks stack traces or non-public fields. */
  public toJSON(): {
    name: string;
    message: string;
    code: ErrorCode;
    statusCode: HttpStatusCode;
    metadata?: Readonly<Record<string, unknown>>;
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(this.metadata ? { metadata: this.metadata } : {}),
    };
  }
}