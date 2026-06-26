import { AI_PROVIDER, type LLMProviderName } from '../../../constants/ai.constants.js';
import { aiConfig } from '../../../config/ai.config.js';
import { AIProviderError } from '../../../errors/AIProviderError.js';
import type { ILLMProvider } from '../../../interfaces/ai/ILLMProvider.js';
import type {
  LLMCompletionRequest,
  LLMCompletionResult,
} from '../../../types/ai.types.js';
import type { Result } from '../../../types/result.types.js';
import { err, ok } from '../../../utils/result-from.util.js';
import { startTimer } from '../../../utils/timer.util.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_REFERER = 'https://github.com/sust-prili';

interface OpenRouterChoice {
  message?: { content?: string };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
  error?: { message?: string };
}

export class OpenRouterProvider implements ILLMProvider {
  public readonly name: LLMProviderName = AI_PROVIDER.OPENROUTER;

  public async complete(
    request: LLMCompletionRequest,
  ): Promise<Result<LLMCompletionResult, AIProviderError>> {
    const apiKey = aiConfig.openrouter.apiKey;
    if (!apiKey) {
      return err(
        new AIProviderError('OpenRouter API key is not configured', {
          provider: this.name,
        }),
      );
    }

    const elapsed = startTimer();
    const timeoutMs = request.timeoutMs ?? aiConfig.timeoutMs;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': OPENROUTER_REFERER,
          'X-Title': 'QueueStorm Investigator',
        },
        body: JSON.stringify({
          model: request.model ?? aiConfig.openrouter.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.2,
          max_tokens: request.maxTokens ?? 800,
        }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as OpenRouterResponse;

      if (!response.ok) {
        return err(
          new AIProviderError(payload.error?.message ?? 'OpenRouter request failed', {
            provider: this.name,
            upstreamStatus: response.status,
            metadata: { payload },
          }),
        );
      }

      const content = payload.choices?.[0]?.message?.content ?? '';
      if (!content.trim()) {
        return err(
          new AIProviderError('OpenRouter returned empty content', {
            provider: this.name,
            metadata: { payload },
          }),
        );
      }

      return ok({
        provider: this.name,
        model: request.model ?? aiConfig.openrouter.model,
        content,
        raw: payload,
        durationMs: elapsed(),
      });
    } catch (cause) {
      const timedOut = cause instanceof Error && cause.name === 'AbortError';
      return err(
        new AIProviderError(timedOut ? 'OpenRouter request timed out' : 'OpenRouter request failed', {
          provider: this.name,
          cause,
        }),
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
