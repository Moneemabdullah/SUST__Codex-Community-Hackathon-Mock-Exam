import type { IErrorHandler } from '../interfaces/middleware/IErrorHandler.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { fail } from '../utils/response.util.js';

/**
 * 404 middleware. Runs after every route; converts the implicit "route
 * not matched" into a structured JSON envelope.
 */
export const notFoundMiddleware: IErrorHandler = (req, res, next) => {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    path: req.originalUrl ?? req.url,
  });
  // `next(err)` would route through error-handler; we want to send the response
  // directly using the envelope so the 404 keeps the same shape.
  void error;
  fail(res, error.statusCode, error.code, error.message, {
    details: { method: req.method, path: req.originalUrl ?? req.url },
  });
};