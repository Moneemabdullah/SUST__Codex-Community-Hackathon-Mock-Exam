import type { Result } from '../../types/result.types.js';
import type { LLMCompletionRequest, LLMCompletionResult } from '../../types/ai.types.js';
import type { LLMProviderName } from '../../constants/ai.constants.js';
import type { AIProviderError } from '../../errors/AIProviderError.js';

/**
 * Port for any LLM provider. Implementations translate the neutral request
 * shape into the provider's SDK and translate errors back into the neutral
 * `AIProviderError`.
 */
export interface ILLMProvider {
  readonly name: LLMProviderName;
  complete(request: LLMCompletionRequest): Promise<Result<LLMCompletionResult, AIProviderError>>;
}