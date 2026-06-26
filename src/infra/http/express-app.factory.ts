import express, { type Application, type RequestHandler, type Router } from 'express';
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
import { judgeErrorHandlerMiddleware } from '../../middleware/judge-error-handler.middleware.js';
import { httpLoggerMiddleware } from '../logger/logger.middleware.js';

export interface BuildAppOptions {
  /** Routers wired by the composition root. */
  readonly docsRouter: Router;
  readonly judgeRouter: Router;
  readonly apiRouter: Router;
  /** Hook for tests to swap middleware (e.g. disable rate limit). */
  beforeMountRoutes?: (app: Application) => void;
}

/**
 * Express application factory.
 *
 * Order is canonical and non-negotiable; see `docs/ARCHITECTURE.md`.
 * No `listen()` here — that's the responsibility of `server.ts`.
 */
export const buildExpressApp = (options: BuildAppOptions): Application => {
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
  app.use('/docs', options.docsRouter);

  // [10] Judge harness routes — raw JSON at application root (before api router).
  app.use(options.judgeRouter);

  // [11] Internal API routes (envelope responses).
  app.use(options.apiRouter);

  // [12] 404
  app.use(notFoundMiddleware);

  // [13] Judge flat errors (must precede envelope error handler).
  app.use(judgeErrorHandlerMiddleware(rootLogger));

  // [14] Global error handler (must be last)
  app.use(errorHandlerMiddleware(rootLogger));

  return app;
};

// Re-export the RequestHandler type for tests that need to inject middleware.
export type { RequestHandler };