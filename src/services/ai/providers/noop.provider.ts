import { AI_PROVIDER, type LLMProviderName } from '../../../constants/ai.constants.js';
import type { ILLMProvider } from '../../../interfaces/ai/ILLMProvider.js';
import type {
  LLMCompletionRequest,
  LLMCompletionResult,
} from '../../../types/ai.types.js';
import type { Result } from '../../../types/result.types.js';
import { ok } from '../../../utils/result-from.util.js';
import { startTimer } from '../../../utils/timer.util.js';

/**
 * Deterministic provider used for local development, CI, and the scaffolding
 * milestone. It does not perform any network IO and always returns a neutral
 * "no model" content string. Real providers (openai, gemini, claude,
 * openrouter) will be added in a follow-up milestone.
 */
export class NoopProvider implements ILLMProvider {
  public readonly name: LLMProviderName = AI_PROVIDER.NOOP;

  public async complete(
    _request: LLMCompletionRequest,
  ): Promise<Result<LLMCompletionResult, never>> {
    const elapsed = startTimer();
    const result: LLMCompletionResult = {
      provider: this.name,
      model: 'noop',
      content: '',
      durationMs: elapsed(),
    };
    return ok(result);
  }
}
