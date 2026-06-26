import { env } from './env.config.js';
import { AI_PROVIDER, type LLMProviderName } from '../constants/ai.constants.js';

export interface AIConfig {
  readonly provider: LLMProviderName;
  readonly timeoutMs: number;
  readonly openai: { readonly apiKey?: string; readonly model: string };
  readonly gemini: { readonly apiKey?: string; readonly model: string };
  readonly claude: { readonly apiKey?: string; readonly model: string };
  readonly openrouter: { readonly apiKey?: string; readonly model: string };
}

export const aiConfig: Readonly<AIConfig> = Object.freeze({
  provider: env.AI_PROVIDER as LLMProviderName,
  timeoutMs: env.AI_TIMEOUT_MS,
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
  },
  claude: {
    apiKey: env.CLAUDE_API_KEY,
    model: env.CLAUDE_MODEL,
  },
  openrouter: {
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
  },
});

export const isAIConfigured = (): boolean => {
  switch (aiConfig.provider) {
    case AI_PROVIDER.NOOP:
      return true;
    case AI_PROVIDER.OPENAI:
      return Boolean(aiConfig.openai.apiKey);
    case AI_PROVIDER.GEMINI:
      return Boolean(aiConfig.gemini.apiKey);
    case AI_PROVIDER.CLAUDE:
      return Boolean(aiConfig.claude.apiKey);
    case AI_PROVIDER.OPENROUTER:
      return Boolean(aiConfig.openrouter.apiKey);
    default:
      return false;
  }
};