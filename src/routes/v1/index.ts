import { Router } from 'express';

import { buildHealthRouter } from './health.routes.js';
import { buildMetricsRouter } from './metrics.routes.js';
import { buildVersionRouter } from './version.routes.js';
import type { HealthService } from '../../services/health.service.js';
import type { VersionService } from '../../services/version.service.js';

export interface V1Routes {
  readonly health: Router;
  readonly version: Router;
  readonly metrics: Router;
  readonly combined: Router;
}

export const buildV1Router = (
  healthService: HealthService,
  versionService: VersionService,
): V1Routes => {
  const health = buildHealthRouter(healthService);
  const version = buildVersionRouter(versionService);
  const metrics = buildMetricsRouter();

  const combined = Router();
  combined.use(health);
  combined.use(version);
  combined.use(metrics);

  return Object.freeze({ health, version, metrics, combined });
};