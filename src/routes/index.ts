import { Router } from 'express';

import type { HealthService } from '../services/health.service.js';
import type { VersionService } from '../services/version.service.js';
import { buildV1Router } from './v1/index.js';

export interface ApiRouterDeps {
  readonly healthService: HealthService;
  readonly versionService: VersionService;
}

export const buildApiRouter = (deps: ApiRouterDeps): Router => {
  const router = Router();

  router.use('/v1', buildV1Router(deps));

  return router;
};

export { buildV1Router } from './v1/index.js';