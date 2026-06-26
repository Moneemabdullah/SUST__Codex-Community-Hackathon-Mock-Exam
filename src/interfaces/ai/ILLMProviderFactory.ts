import type { ILLMProvider } from './ILLMProvider.js';

/**
 * Factory port. The factory reads config and returns the provider that
 * matches the configured `AI_PROVIDER`.
 */
export interface ILLMProviderFactory {
  create(): ILLMProvider;
}