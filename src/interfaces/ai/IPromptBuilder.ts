import type { LLMMessage } from '../../types/ai.types.js';
import type { TicketAnalysisRequest } from '../../types/ticket.types.js';

/**
 * Builds the prompt the LLM sees for the analyze-ticket use case.
 *
 * Kept as an interface so prompts can be swapped, versioned, or mocked
 * without touching the ticket-analyzer service.
 */
export interface IPromptBuilder {
  buildSystem(): LLMMessage;
  buildUser(request: TicketAnalysisRequest): LLMMessage;
}