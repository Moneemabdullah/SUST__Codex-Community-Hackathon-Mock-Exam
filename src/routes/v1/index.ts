import { Router } from 'express';

import type { HealthService } from '../../services/health.service.js';
import type { VersionService } from '../../services/version.service.js';
import { buildHealthRouter } from './health.routes.js';
import { buildMetricsRouter } from './metrics.routes.js';
import { buildVersionRouter } from './version.routes.js';

export interface V1RouterDeps {
  readonly healthService: HealthService;
  readonly versionService: VersionService;
}

export const buildV1Router = (deps: V1RouterDeps): Router => {
  const router = Router();

  router.use(buildHealthRouter(deps.healthService));
  router.use(buildVersionRouter(deps.versionService));
  router.use(buildMetricsRouter());

  return router;
};