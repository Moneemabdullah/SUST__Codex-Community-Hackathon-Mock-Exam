import { Router } from 'express';

import { buildVersionController } from '../../controllers/version.controller.js';
import { asyncHandler } from '../../middleware/async-handler.middleware.js';
import type { VersionService } from '../../services/version.service.js';

/**
 * @openapi
 * /v1/version:
 *   get:
 *     tags: [Meta]
 *     summary: Build / instance metadata
 *     responses:
 *       200:
 *         description: Version info
 */
export const buildVersionRouter = (service: VersionService): Router => {
  const router = Router();
  const controller = buildVersionController(service);

  router.get('/version', asyncHandler(controller));

  return router;
};