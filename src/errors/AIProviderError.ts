import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/http.constants.js';
import { ERROR_CODE } from '../constants/error.constants.js';
import type { LLMProviderName } from '../constants/ai.constants.js';

export interface AIProviderErrorOptions {
  provider: LLMProviderName;
  upstreamStatus?: number;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export class AIProviderError extends AppError {
  public readonly provider: LLMProviderName;
  public readonly upstreamStatus?: number;

  constructor(message: string, options: AIProviderErrorOptions) {
    super(message, HTTP_STATUS.BAD_GATEWAY, ERROR_CODE.AI_PROVIDER_ERROR, {
      metadata: {
        provider: options.provider,
        ...(options.upstreamStatus !== undefined ? { upstreamStatus: options.upstreamStatus } : {}),
        ...(options.metadata ?? {}),
      },
      cause: options.cause,
    });
    this.provider = options.provider;
    if (options.upstreamStatus !== undefined) {
      this.upstreamStatus = options.upstreamStatus;
    }
  }
}