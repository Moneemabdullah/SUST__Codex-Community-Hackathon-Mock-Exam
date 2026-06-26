import compression from 'compression';
import type { RequestHandler } from 'express';

export const compressionMiddleware = (): RequestHandler =>
  compression({
    threshold: 1024,
    level: 6,
  });