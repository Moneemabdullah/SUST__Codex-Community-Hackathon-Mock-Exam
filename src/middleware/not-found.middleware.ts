import type { IMiddleware } from '../interfaces/middleware/IMiddleware.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { fail } from '../utils/response.util.js';

/**
 * 404 middleware. Runs after every route; converts the implicit "route
 * not matched" into a structured JSON envelope.
 */
export const notFoundMiddleware: IMiddleware = (req, res, _next) => {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    path: req.originalUrl ?? req.url,
  });
  fail(res, error.statusCode, error.code, error.message, {
    details: { method: req.method, path: req.originalUrl ?? req.url },
  });
};