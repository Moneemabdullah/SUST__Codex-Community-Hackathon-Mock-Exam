import { AI_PROVIDER, type LLMProviderName } from '../../constants/ai.constants.js';
import { AIProviderError } from '../../errors/AIProviderError.js';
import type { ILLMProvider } from '../../interfaces/ai/ILLMProvider.js';
import type { ILLMProviderFactory } from '../../interfaces/ai/ILLMProviderFactory.js';
import { aiConfig } from '../../config/ai.config.js';
import { NoopProvider } from './providers/noop.provider.js';

type ProviderConstructor = new () => ILLMProvider;

/**
 * Registry of LLM provider constructors keyed by `AI_PROVIDER` value.
 *
 * Only providers with an implemented adapter are listed. Selecting an
 * unlisted provider at boot causes an `AIProviderError` — fail-fast is
 * intentional so we never silently route to a stub.
 */
const REGISTRY: Readonly<Record<LLMProviderName, ProviderConstructor | undefined>> =
  Object.freeze({
    [AI_PROVIDER.NOOP]: NoopProvider,
    [AI_PROVIDER.OPENAI]: undefined,
    [AI_PROVIDER.GEMINI]: undefined,
    [AI_PROVIDER.CLAUDE]: undefined,
    [AI_PROVIDER.OPENROUTER]: undefined,
  });

export class LLMProviderFactory implements ILLMProviderFactory {
  public create(): ILLMProvider {
    const Provider = REGISTRY[aiConfig.provider];

    if (!Provider) {
      throw new AIProviderError(
        `LLM provider '${aiConfig.provider}' has no registered adapter`,
        { provider: aiConfig.provider },
      );
    }

    return new Provider();
  }
}