/**
 * Environment variable *names* — declared once so renames are grep-safe.
 * Values are read and validated by `config/env.config.ts`.
 */
export const ENV_KEY = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',
  LOG_LEVEL: 'LOG_LEVEL',
  SHUTDOWN_TIMEOUT_MS: 'SHUTDOWN_TIMEOUT_MS',

  APP_NAME: 'APP_NAME',
  APP_VERSION: 'APP_VERSION',

  CORS_ORIGINS: 'CORS_ORIGINS',
  TRUST_PROXY: 'TRUST_PROXY',
  RATE_LIMIT_WINDOW_MS: 'RATE_LIMIT_WINDOW_MS',
  RATE_LIMIT_MAX: 'RATE_LIMIT_MAX',

  AI_PROVIDER: 'AI_PROVIDER',
  AI_TIMEOUT_MS: 'AI_TIMEOUT_MS',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_MODEL: 'OPENAI_MODEL',
  GEMINI_API_KEY: 'GEMINI_API_KEY',
  GEMINI_MODEL: 'GEMINI_MODEL',
  CLAUDE_API_KEY: 'CLAUDE_API_KEY',
  CLAUDE_MODEL: 'CLAUDE_MODEL',
  OPENROUTER_API_KEY: 'OPENROUTER_API_KEY',
  OPENROUTER_MODEL: 'OPENROUTER_MODEL',
} as const;

export type EnvKey = (typeof ENV_KEY)[keyof typeof ENV_KEY];

export const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;
export type NodeEnv = (typeof NODE_ENV_VALUES)[number];