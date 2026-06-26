import type { IController } from '../interfaces/http/IController.js';
import { sendJudgeHealth } from '../utils/judge-response.util.js';

/** Judge harness liveness — raw `{"status":"ok"}` only. */
export const judgeHealthController: IController = (_req, res) => {
  sendJudgeHealth(res);
};
