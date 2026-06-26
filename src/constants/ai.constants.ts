/**
 * AI provider identifiers. Used as the discriminator in the LLM provider
 * registry and as the value for `AI_PROVIDER` in the environment.
 */
export const AI_PROVIDER = {
  NOOP: 'noop',
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
  OPENROUTER: 'openrouter',
} as const;

export type LLMProviderName = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export const SUPPORTED_PROVIDERS: readonly LLMProviderName[] = [
  AI_PROVIDER.NOOP,
  AI_PROVIDER.OPENAI,
  AI_PROVIDER.GEMINI,
  AI_PROVIDER.CLAUDE,
  AI_PROVIDER.OPENROUTER,
];