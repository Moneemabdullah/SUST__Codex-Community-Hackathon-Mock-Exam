import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { securityConfig } from '../config/security.config.js';
import { RateLimitError } from '../errors/RateLimitError.js';

export const rateLimitMiddleware = (): RequestHandler => {
  const limiter = rateLimit({
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.max,
    standardHeaders: securityConfig.rateLimit.standardHeaders,
    legacyHeaders: securityConfig.rateLimit.legacyHeaders,
    keyGenerator: (req) => req.ip ?? 'unknown',
    handler: (req, _res, next) => {
      const retryAfterSeconds = Math.ceil(securityConfig.rateLimit.windowMs / 1000);
      next(
        new RateLimitError('Too many requests', {
          retryAfterSeconds,
          metadata: { ip: req.ip ?? 'unknown', path: req.originalUrl ?? req.url },
        }),
      );
    },
  });
  return limiter;
};