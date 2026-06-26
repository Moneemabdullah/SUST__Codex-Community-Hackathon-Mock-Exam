import type { IRequest, IResponse, INextFunction } from '../http/index.js';

export type IMiddleware = (
  req: IRequest,
  res: IResponse,
  next: INextFunction,
) => Promise<unknown> | unknown;