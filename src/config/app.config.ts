import { env } from './env.config.js';

export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly nodeEnv: 'development' | 'production' | 'test';
  readonly instanceId: string;
  readonly port: number;
  readonly host: string;
  readonly shutdownTimeoutMs: number;
}

const instanceId = `${process.pid}-${Date.now().toString(36)}`;

export const appConfig: Readonly<AppConfig> = Object.freeze({
  name: env.APP_NAME,
  version: env.APP_VERSION,
  nodeEnv: env.NODE_ENV,
  instanceId,
  port: env.PORT,
  host: env.HOST,
  shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
});