import type { IRequest, IResponse, INextFunction } from '../http/index.js';

/**
 * Express signature for an error-handling middleware (4 args).
 */
export type IErrorHandler = (
  err: unknown,
  req: IRequest,
  res: IResponse,
  next: INextFunction,
) => void;