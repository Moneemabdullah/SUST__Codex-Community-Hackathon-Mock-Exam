import { env, isDevelopment, isProduction } from './env.config.js';
import { appConfig } from './app.config.js';
import type { LoggerOptions } from 'pino';

export interface LoggerConfig {
  readonly level: string;
  readonly options: LoggerOptions;
  readonly pretty: boolean;
}

/**
 * Redacts secrets from logs. Keep this list aligned with `.env.example`.
 */
const REDACT_PATHS: readonly string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.token',
  '*.apiKey',
  '*.api_key',
  '*.secret',
];

const baseOptions: LoggerOptions = {
  level: env.LOG_LEVEL,
  base: {
    service: appConfig.name,
    version: appConfig.version,
    instanceId: appConfig.instanceId,
    env: appConfig.nodeEnv,
  },
  redact: {
    paths: REDACT_PATHS as string[],
    censor: '[REDACTED]',
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

const devOptions: LoggerOptions = {
  ...baseOptions,
  level: env.LOG_LEVEL === 'silent' ? 'silent' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname,instanceId',
      singleLine: false,
    },
  },
};

const prodOptions: LoggerOptions = {
  ...baseOptions,
  level: env.LOG_LEVEL === 'silent' ? 'silent' : 'info',
};

export const loggerConfig: Readonly<LoggerConfig> = Object.freeze({
  level: baseOptions.level ?? 'info',
  pretty: isDevelopment(),
  options: isProduction() ? prodOptions : devOptions,
});