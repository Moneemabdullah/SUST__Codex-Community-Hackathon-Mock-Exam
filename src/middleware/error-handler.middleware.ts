import type { Logger } from 'pino';
import type { IErrorHandler } from '../interfaces/middleware/IErrorHandler.js';
import { AppError } from '../errors/AppError.js';
import { InternalServerError } from '../errors/InternalServerError.js';
import { fail } from '../utils/response.util.js';
import { isProduction } from '../config/env.config.js';

/**
 * Global error handler. Maps `AppError` to its status + envelope, and
 * wraps anything else in `InternalServerError`. Stack traces are
 * included in logs but NEVER in responses in production.
 */
export const errorHandlerMiddleware =
  (logger: Logger): IErrorHandler =>
  (err, req, res, _next) => {
    const error = err instanceof AppError ? err : new InternalServerError(undefined, undefined, err);

    const log = req.log ?? logger;
    const fields = {
      reqId: req.id,
      method: req.method,
      path: req.originalUrl ?? req.url,
      code: error.code,
      statusCode: error.statusCode,
      err,
    };

    if (error.statusCode >= 500) {
      log.error(fields, error.message);
    } else {
      log.warn(fields, error.message);
    }

    fail(res, error.statusCode, error.code, error.message, {
      ...(error.metadata ? { details: error.metadata } : {}),
    });

    // In production we make absolutely sure no stack is leaked.
    if (!isProduction() && error.stack) {
      // Stack is appended only for non-prod local visibility via logs,
      // not the response. The line above already logs the stack via the
      // standard Pino error serializer.
      void error.stack;
    }
  };