import type { IController } from '../interfaces/http/IController.js';
import type { INextFunction } from '../interfaces/http/INextFunction.js';
import type { IRequest } from '../interfaces/http/IRequest.js';
import type { IResponse } from '../interfaces/http/IResponse.js';

/**
 * Wraps an async/sync controller so any rejected promise (or thrown
 * error) is forwarded to Express' error-handling middleware instead of
 * crashing the process.
 */
export const asyncHandler =
  (fn: IController) =>
  (req: IRequest, res: IResponse, next: INextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };