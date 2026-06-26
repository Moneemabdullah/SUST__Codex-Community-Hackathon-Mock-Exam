import type { RequestHandler } from 'express';

/**
 * Belt-and-braces hardening headers applied after rate limiting.
 *
 * Most of these are also set by Helmet; we keep an explicit pass here
 * so future security audits can read the policy in one place.
 */
export const securityHeadersMiddleware = (): RequestHandler => (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
};