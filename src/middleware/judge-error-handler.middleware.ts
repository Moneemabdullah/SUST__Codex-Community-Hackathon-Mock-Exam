import type { Logger } from 'pino';

import type { IErrorHandler } from '../interfaces/middleware/IErrorHandler.js';
import { ValidationError } from '../errors/ValidationError.js';
import { sendJudgeError } from '../utils/judge-response.util.js';
import { HTTP_STATUS } from '../constants/http.constants.js';

const JUDGE_PATHS = new Set(['/health', '/analyze-ticket']);

export const isJudgePath = (path: string): boolean => JUDGE_PATHS.has(path);

const isJsonSyntaxError = (err: unknown): err is SyntaxError & { body: unknown } =>
  err instanceof SyntaxError && typeof err === 'object' && err !== null && 'body' in err;

/**
 * Flat error responses for judge harness routes. Mounted ahead of the
 * global envelope error handler so `/health` and `/analyze-ticket`
 * never return `{ success, message, data, meta }`.
 */
export const judgeErrorHandlerMiddleware =
  (logger: Logger): IErrorHandler =>
  (err, req, res, next) => {
    if (!isJudgePath(req.path)) {
      next(err);
      return;
    }

    if (res.headersSent) {
      next(err);
      return;
    }

    const log = req.log ?? logger;

    if (isJsonSyntaxError(err)) {
      log.warn({ reqId: req.id, path: req.path }, 'Invalid JSON on judge route');
      sendJudgeError(res, HTTP_STATUS.BAD_REQUEST, 'Invalid JSON');
      return;
    }

    if (err instanceof ValidationError) {
      log.warn({ reqId: req.id, path: req.path, fields: err.fields }, err.message);
      sendJudgeError(res, HTTP_STATUS.BAD_REQUEST, err.message);
      return;
    }

    log.error({ reqId: req.id, path: req.path, err }, 'Judge route internal error');
    sendJudgeError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error');
  };
