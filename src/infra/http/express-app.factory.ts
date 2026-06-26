import express, { type Application, type RequestHandler } from 'express';
import { securityConfig } from '../../config/security.config.js';
import { rootLogger } from '../logger/pino.logger.js';
import {
  compressionMiddleware,
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  requestIdMiddleware,
  notFoundMiddleware,
  errorHandlerMiddleware,
  securityHeadersMiddleware,
} from '../../middleware/index.js';
import { httpLoggerMiddleware } from '../logger/logger.middleware.js';
import { apiRouter } from '../../routes/index.js';
import { docsRouter } from '../../routes/docs.routes.js';

export interface BuildAppOptions {
  /** Hook for tests to swap middleware/router (e.g. disable rate limit). */
  beforeMountRoutes?: (app: Application) => void;
}

/**
 * Express application factory.
 *
 * Order is canonical and non-negotiable; see `docs/ARCHITECTURE.md`.
 * No `listen()` here — that's the responsibility of `server.ts`.
 */
export const buildExpressApp = (options: BuildAppOptions = {}): Application => {
  const app = express();

  if (securityConfig.trustProxy) {
    app.set('trust proxy', true);
  }

  // [1] trust proxy — applied above.
  // [2] Helmet
  app.use(helmetMiddleware());
  // [3] Compression
  app.use(compressionMiddleware());
  // [4] CORS
  app.use(corsMiddleware());
  // [5] JSON body parser
  app.use(express.json({ limit: '100kb' }));
  // [6] URL-encoded parser
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  // [7] Request ID
  app.use(requestIdMiddleware());
  // [8] HTTP logger (binds req.log)
  app.use(httpLoggerMiddleware);
  // [9] Rate limiter
  app.use(rateLimitMiddleware());
  // [9.5] Extra hardening headers (defence in depth)
  app.use(securityHeadersMiddleware());

  options.beforeMountRoutes?.(app);

  // Docs first so it doesn't get hidden behind a future rate-limit tuning.
  app.use('/docs', docsRouter());

  // [10] Routers
  app.use(apiRouter);

  // [11] 404
  app.use(notFoundMiddleware);

  // [12] Global error handler (must be last)
  app.use(errorHandlerMiddleware(rootLogger));

  return app;
};

// Re-export the RequestHandler type for tests that need to inject middleware.
export type { RequestHandler };