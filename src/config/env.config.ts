import 'dotenv/config';
import { z } from 'zod';
import { ENV_KEY, NODE_ENV_VALUES, type NodeEnv } from '../constants/env.constants.js';
import { AI_PROVIDER, SUPPORTED_PROVIDERS } from '../constants/ai.constants.js';

/**
 * Schema used to validate `process.env` at boot. A failure here crashes
 * the process with a clear, structured error before anything else runs —
 * there is no silent prod misconfiguration.
 */
const envSchema = z.object({
  [ENV_KEY.NODE_ENV]: z.enum(NODE_ENV_VALUES).default('development'),
  [ENV_KEY.PORT]: z.coerce.number().int().positive().default(3000),
  [ENV_KEY.HOST]: z.string().default('0.0.0.0'),
  [ENV_KEY.LOG_LEVEL]: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  [ENV_KEY.SHUTDOWN_TIMEOUT_MS]: z.coerce.number().int().positive().default(15000),

  [ENV_KEY.APP_NAME]: z.string().min(1).default('sust-prili'),
  [ENV_KEY.APP_VERSION]: z.string().min(1).default('0.1.0'),

  [ENV_KEY.CORS_ORIGINS]: z.string().default('*'),
  [ENV_KEY.TRUST_PROXY]: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .transform((v) => v === true || v === 'true' || v === '1')
    .default(false),
  [ENV_KEY.RATE_LIMIT_WINDOW_MS]: z.coerce.number().int().positive().default(60_000),
  [ENV_KEY.RATE_LIMIT_MAX]: z.coerce.number().int().positive().default(120),

  [ENV_KEY.AI_PROVIDER]: z.enum(SUPPORTED_PROVIDERS as readonly [string, ...string[]]).default(AI_PROVIDER.NOOP),
  [ENV_KEY.AI_TIMEOUT_MS]: z.coerce.number().int().positive().default(20_000),

  [ENV_KEY.OPENAI_API_KEY]: z.string().optional(),
  [ENV_KEY.OPENAI_MODEL]: z.string().default('gpt-4o-mini'),
  [ENV_KEY.GEMINI_API_KEY]: z.string().optional(),
  [ENV_KEY.GEMINI_MODEL]: z.string().default('gemini-1.5-flash'),
  [ENV_KEY.CLAUDE_API_KEY]: z.string().optional(),
  [ENV_KEY.CLAUDE_MODEL]: z.string().default('claude-3-5-sonnet-latest'),
  [ENV_KEY.OPENROUTER_API_KEY]: z.string().optional(),
  [ENV_KEY.OPENROUTER_MODEL]: z.string().default('nvidia/nemotron-3-super-120b-a12b:free'),
});

export type RawEnv = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Print all issues and exit — there is no point continuing with a bad config.
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ msg: 'Invalid environment configuration', issues: parsed.error.issues }, null, 2));
  process.exit(1);
}

export const env: Readonly<RawEnv> = Object.freeze(parsed.data);

export const isProduction = (): boolean => env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isTest = (): boolean => env.NODE_ENV === 'test';
export const nodeEnv = (): NodeEnv => env.NODE_ENV;