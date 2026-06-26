import type { ILLMProvider } from '../../interfaces/ai/ILLMProvider.js';
import type { ITicketAnalyzerService } from '../../interfaces/services/ITicketAnalyzerService.js';
import type {
  TicketAnalysisRequest,
  TicketAnalysisResponse,
} from '../../types/ticket.types.js';
import type { AppError } from '../../errors/AppError.js';
import type { Result } from '../../types/result.types.js';
import { ok } from '../../utils/result-from.util.js';
import { generateProse } from './ticket-prose.service.js';
import { analyzeStructured } from './ticket-rules.engine.js';

/**
 * Orchestrates ticket analysis: rules engine for structured fields,
 * LLM for prose fields (with template fallback).
 */
export class TicketAnalyzerService implements ITicketAnalyzerService {
  public constructor(private readonly provider: ILLMProvider) {}

  public async analyze(
    request: TicketAnalysisRequest,
  ): Promise<Result<TicketAnalysisResponse, AppError>> {
    const structured = analyzeStructured(request);
    const prose = await generateProse(request, structured, this.provider);

    return ok({
      ticket_id: request.ticket_id,
      ...structured,
      ...prose,
    });
  }
}
