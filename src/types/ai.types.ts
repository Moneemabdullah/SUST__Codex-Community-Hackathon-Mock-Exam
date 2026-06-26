import type { LLMProviderName } from '../constants/ai.constants.js';

export type LLMMessageRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
  role: LLMMessageRole;
  content: string;
}

export interface LLMCompletionRequest {
  model?: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Caller-provided JSON shape description for providers that support structured output. */
  responseShape?: string;
  /** Optional timeout (ms) overriding the provider default. */
  timeoutMs?: number;
}

export interface LLMUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface LLMCompletionResult {
  provider: LLMProviderName;
  model: string;
  content: string;
  raw?: unknown;
  usage?: LLMUsage;
  durationMs: number;
}