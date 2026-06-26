import { Router } from 'express';

import { judgeHealthController } from '../controllers/judge-health.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import type { IController } from '../interfaces/http/IController.js';

export interface JudgeRouterDeps {
  readonly analyzeTicketController: IController;
}

export const buildJudgeRouter = (deps: JudgeRouterDeps): Router => {
  const router = Router();

  router.get('/health', asyncHandler(judgeHealthController));
  router.post('/analyze-ticket', asyncHandler(deps.analyzeTicketController));

  return router;
};
