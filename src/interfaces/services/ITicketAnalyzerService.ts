import type { Result } from '../../types/result.types.js';
import type { TicketAnalysisRequest, TicketAnalysisResponse } from '../../types/ticket.types.js';
import type { AppError } from '../../errors/AppError.js';

/**
 * Port for the ticket-analysis use case.
 *
 * Returns a `Result` so callers must handle both success and failure
 * explicitly; no exceptions cross this boundary.
 */
export interface ITicketAnalyzerService {
  analyze(request: TicketAnalysisRequest): Promise<Result<TicketAnalysisResponse, AppError>>;
}