import type { IController } from '../interfaces/http/IController.js';
import {
  CASE_TYPE,
  DEPARTMENT,
  EVIDENCE_VERDICT,
  SEVERITY,
} from '../constants/ticket.constants.js';
import { HTTP_STATUS, CONTENT_TYPE } from '../constants/http.constants.js';
import type { TicketAnalysisResponse } from '../types/ticket.types.js';
import type { AnalyzeTicketRequestDto } from '../validators/schemas/analyze-ticket.schema.js';

/** Minimal stub response until the analyzer pipeline is wired (phase 6). */
const buildStubResponse = (request: AnalyzeTicketRequestDto): TicketAnalysisResponse => ({
  ticket_id: request.ticket_id,
  relevant_transaction_id: null,
  evidence_verdict: EVIDENCE_VERDICT.INSUFFICIENT_DATA,
  case_type: CASE_TYPE.OTHER,
  severity: SEVERITY.LOW,
  department: DEPARTMENT.CUSTOMER_SUPPORT,
  agent_summary: 'Stub response — analyzer not yet implemented.',
  recommended_next_action: 'Implement rules engine in phase 3.',
  customer_reply:
    'Thank you for reaching out. Please do not share your PIN or OTP with anyone.',
  human_review_required: false,
});

export const buildAnalyzeTicketController = (): IController => (req, res) => {
  const request = req.body as AnalyzeTicketRequestDto;

  res
    .status(HTTP_STATUS.OK)
    .type(CONTENT_TYPE.JSON)
    .json(buildStubResponse(request));
};
