import { Router } from 'express';

import { buildVersionController } from '../../controllers/version.controller.js';
import { asyncHandler } from '../../middleware/async-handler.middleware.js';
import type { VersionService } from '../../services/version.service.js';

export const buildVersionRouter = (service: VersionService): Router => {
  const router = Router();
  const controller = buildVersionController(service);

  router.get('/version', asyncHandler(controller));

  return router;
};