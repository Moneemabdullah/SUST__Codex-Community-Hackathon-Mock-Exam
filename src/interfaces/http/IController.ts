import type { IRequest, IResponse, INextFunction } from './index.js';

/**
 * Standard Express controller signature. Implementations are wrapped by
 * `asyncHandler` so rejections automatically reach the error middleware.
 */
export type IController = (req: IRequest, res: IResponse, next: INextFunction) => Promise<unknown> | unknown;