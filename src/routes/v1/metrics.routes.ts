import { Router } from 'express';

import { metricsController } from '../../controllers/metrics.controller.js';
import { asyncHandler } from '../../middleware/async-handler.middleware.js';

export const buildMetricsRouter = (): Router => {
  const router = Router();

  router.get('/metrics', asyncHandler(metricsController));

  return router;
};