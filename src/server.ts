import { createServer, type Server } from 'node:http';

import type { Application } from 'express';

export interface BuildServerOptions {
  readonly app: Application;
}

/**
 * Wraps an Express application in a Node `http.Server`. Kept separate from
 * `app.ts` so tests can `buildServer()` without binding to a port and so
 * graceful-shutdown wiring (in `main.ts`) owns the `Server` lifecycle.
 */
export const buildServer = (options: BuildServerOptions): Server => {
  return createServer(options.app);
};