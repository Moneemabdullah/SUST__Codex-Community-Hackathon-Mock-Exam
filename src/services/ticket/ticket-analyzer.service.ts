import type { ILLMProvider } from '../../interfaces/ai/ILLMProvider.js';
import type { ITicketAnalyzerService } from '../../interfaces/services/ITicketAnalyzerService.js';
import type {
  TicketAnalysisRequest,
  TicketAnalysisResponse,
} from '../../types/ticket.types.js';
import type { AppError } from '../../errors/AppError.js';
import type { Result } from '../../types/result.types.js';
import { ok } from '../../utils/result-from.util.js';
import { analyzeStructured } from './ticket-rules.engine.js';

const PLACEHOLDER_PROSE = {
  agent_summary: 'Structured analysis complete. Prose generation pending.',
  recommended_next_action: 'Review structured fields and generate operational guidance via LLM.',
  customer_reply:
    'Thank you for reaching out. Please do not share your PIN or OTP with anyone.',
} as const;

/**
 * Orchestrates ticket analysis: rules engine for structured fields,
 * LLM prose generation added in phase 4.
 */
export class TicketAnalyzerService implements ITicketAnalyzerService {
  public constructor(private readonly provider: ILLMProvider) {}

  public async analyze(
    request: TicketAnalysisRequest,
  ): Promise<Result<TicketAnalysisResponse, AppError>> {
    void this.provider;

    const structured = analyzeStructured(request);

    return ok({
      ticket_id: request.ticket_id,
      ...structured,
      ...PLACEHOLDER_PROSE,
    });
  }
}
