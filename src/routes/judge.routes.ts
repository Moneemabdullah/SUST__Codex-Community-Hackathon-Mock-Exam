import { Router } from 'express';

import { judgeHealthController } from '../controllers/judge-health.controller.js';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { analyzeTicketRequestSchema } from '../validators/schemas/analyze-ticket.schema.js';
import { validate } from '../validators/middlewares/validate.middleware.js';
import { validateAnalyzeTicketSemantics } from '../validators/middlewares/analyze-ticket-semantic.middleware.js';
import type { IController } from '../interfaces/http/IController.js';

export interface JudgeRouterDeps {
  readonly analyzeTicketController: IController;
}

export const buildJudgeRouter = (deps: JudgeRouterDeps): Router => {
  const router = Router();

  router.get('/health', asyncHandler(judgeHealthController));
  router.post(
    '/analyze-ticket',
    validate({ body: analyzeTicketRequestSchema }),
    validateAnalyzeTicketSemantics(),
    asyncHandler(deps.analyzeTicketController),
  );

  return router;
};
