import type { ILLMProvider } from '../../interfaces/ai/ILLMProvider.js';
import type { ITicketAnalyzerService } from '../../interfaces/services/ITicketAnalyzerService.js';
import type {
  TicketAnalysisRequest,
  TicketAnalysisResponse,
} from '../../types/ticket.types.js';
import type { AppError } from '../../errors/AppError.js';
import type { Result } from '../../types/result.types.js';
import { err } from '../../utils/result-from.util.js';
import { AIProviderError } from '../../errors/AIProviderError.js';
import { AI_PROVIDER } from '../../constants/ai.constants.js';

/**
 * Composition root wires the concrete provider. The analyzer itself is
 * intentionally a thin orchestrator in this milestone; prompt assembly,
 * response mapping, and business rules will be added when the
 * `POST /analyze-ticket` handler is implemented (next milestone).
 */
export class TicketAnalyzerService implements ITicketAnalyzerService {
  public constructor(private readonly provider: ILLMProvider) {}

  public async analyze(
    _request: TicketAnalysisRequest,
  ): Promise<Result<TicketAnalysisResponse, AppError>> {
    return err(
      new AIProviderError('Ticket analysis is not implemented in this milestone', {
        provider:
          this.provider.name === AI_PROVIDER.NOOP
            ? AI_PROVIDER.NOOP
            : this.provider.name,
        metadata: { reason: 'analyzer_not_implemented' },
      }),
    );
  }
}