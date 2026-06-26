import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/async-handler.util.js';
import type { IController } from '../interfaces/http/IController.js';

/**
 * Re-export so routes can import `asyncHandlerMiddleware` and keep the
 * transport naming consistent with the other middlewares.
 */
export const asyncHandlerMiddleware =
  (controller: IController): RequestHandler =>
  (req, res, next): void =>
    asyncHandler(controller)(req, res, next);