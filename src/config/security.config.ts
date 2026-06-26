import { env } from './env.config.js';
import type { CorsOptions } from 'cors';

export interface SecurityConfig {
  readonly trustProxy: boolean;
  readonly cors: CorsOptions;
  readonly rateLimit: {
    readonly windowMs: number;
    readonly max: number;
    readonly standardHeaders: boolean;
    readonly legacyHeaders: boolean;
  };
}

const parseOrigins = (raw: string): string[] | true => {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '*') return true;
  return trimmed
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
};

const origins = parseOrigins(env.CORS_ORIGINS);

export const securityConfig: Readonly<SecurityConfig> = Object.freeze({
  trustProxy: env.TRUST_PROXY,
  cors: {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86_400,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  },
});