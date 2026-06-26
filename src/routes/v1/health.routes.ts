import { Router } from 'express';

import { buildHealthController } from '../../controllers/health.controller.js';
import { asyncHandler } from '../../middleware/async-handler.middleware.js';
import type { HealthService } from '../../services/health.service.js';

/**
 * @openapi
 * /v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     responses:
 *       200:
 *         description: Service is up
 */
export const buildHealthRouter = (service: HealthService): Router => {
  const router = Router();
  const controller = buildHealthController(service);

  router.get('/health', asyncHandler(controller));

  return router;
};