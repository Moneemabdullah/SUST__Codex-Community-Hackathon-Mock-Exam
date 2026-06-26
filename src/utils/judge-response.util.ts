import type { Response } from 'express';

import { CONTENT_TYPE, HTTP_STATUS } from '../constants/http.constants.js';

/** Raw health probe — PS §4 */
export const sendJudgeHealth = (res: Response): void => {
  res.status(HTTP_STATUS.OK).type(CONTENT_TYPE.JSON).json({ status: 'ok' });
};

/** Flat error for judge routes — no envelope, no stack traces */
export const sendJudgeError = (
  res: Response,
  statusCode: number,
  message: string,
): void => {
  res.status(statusCode).type(CONTENT_TYPE.JSON).json({ error: message });
};
