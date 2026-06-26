import { Router } from 'express';

import { metricsController } from '../../controllers/metrics.controller.js';
import { asyncHandler } from '../../middleware/async-handler.middleware.js';

/**
 * @openapi
 * /v1/metrics:
 *   get:
 *     tags: [Meta]
 *     summary: Reserved for future Prometheus exposition
 *     responses:
 *       200:
 *         description: Disabled placeholder
 */
export const buildMetricsRouter = (): Router => {
  const router = Router();

  router.get('/metrics', asyncHandler(metricsController));

  return router;
};