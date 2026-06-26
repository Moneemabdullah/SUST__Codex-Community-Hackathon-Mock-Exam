import type { ILLMProvider } from '../../interfaces/ai/ILLMProvider.js';
import type { ITicketAnalyzerService } from '../../interfaces/services/ITicketAnalyzerService.js';
import type {
  TicketAnalysisRequest,
  TicketAnalysisResponse,
} from '../../types/ticket.types.js';
import { AppError } from '../../errors/AppError.js';
import { InternalServerError } from '../../errors/InternalServerError.js';
import type { Result } from '../../types/result.types.js';
import { err, ok } from '../../utils/result-from.util.js';
import {
  sanitizeAgentSummary,
  sanitizeCustomerReply,
  sanitizeNextAction,
  sanitizeUserComplaint,
} from '../../safety/index.js';
import { validateResponse } from '../../validators/response.validator.js';
import { generateProse } from './ticket-prose.service.js';
import { analyzeStructured } from './ticket-rules.engine.js';

const mapToAppError = (error: unknown): AppError =>
  error instanceof AppError ? error : new InternalServerError(undefined, undefined, error);

/**
 * Full analyze-ticket pipeline: sanitize → rules → prose → safety scrub → validate.
 */
export class TicketAnalyzerService implements ITicketAnalyzerService {
  public constructor(private readonly provider: ILLMProvider) {}

  public async analyze(
    request: TicketAnalysisRequest,
  ): Promise<Result<TicketAnalysisResponse, AppError>> {
    try {
      const sanitizedComplaint = sanitizeUserComplaint(request.complaint);
      const sanitizedRequest: TicketAnalysisRequest = {
        ...request,
        complaint: sanitizedComplaint,
      };

      const structured = analyzeStructured(sanitizedRequest);
      const prose = await generateProse(sanitizedRequest, structured, this.provider);

      const response: TicketAnalysisResponse = {
        ticket_id: request.ticket_id,
        relevant_transaction_id: structured.relevant_transaction_id,
        evidence_verdict: structured.evidence_verdict,
        case_type: structured.case_type,
        severity: structured.severity,
        department: structured.department,
        human_review_required: structured.human_review_required,
        agent_summary: sanitizeAgentSummary(prose.agent_summary),
        recommended_next_action: sanitizeNextAction(prose.recommended_next_action),
        customer_reply: sanitizeCustomerReply(prose.customer_reply),
        confidence: structured.confidence,
        reason_codes: structured.reason_codes,
      };

      const validation = validateResponse(response);
      if (!validation.valid) {
        return err(
          new InternalServerError('Response validation failed', {
            errors: validation.errors,
          }),
        );
      }

      return ok(response);
    } catch (error) {
      return err(mapToAppError(error));
    }
  }
}
