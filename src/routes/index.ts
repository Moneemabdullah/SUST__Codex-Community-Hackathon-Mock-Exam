import { Router } from 'express';

import type { V1Routes } from './v1/index.js';

export interface ApiRouterDeps {
  readonly v1Routes: V1Routes;
}

export const buildApiRouter = (deps: ApiRouterDeps): Router => {
  const router = Router();

  router.use('/v1', deps.v1Routes.combined);

  return router;
};