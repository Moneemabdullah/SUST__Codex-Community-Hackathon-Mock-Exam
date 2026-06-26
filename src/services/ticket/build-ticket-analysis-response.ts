import type { TicketAnalysisResponse } from '../../types/ticket.types.js';
import type { ProseFields } from './ticket-prose.service.js';
import type { StructuredAnalysis } from './rules/types.js';

/** Canonical JSON key order for judge responses (PS §6 / sample pack). */
export const TICKET_ANALYSIS_RESPONSE_KEY_ORDER = [
  'ticket_id',
  'relevant_transaction_id',
  'evidence_verdict',
  'case_type',
  'severity',
  'department',
  'agent_summary',
  'recommended_next_action',
  'customer_reply',
  'human_review_required',
  'confidence',
  'reason_codes',
] as const;

export const buildTicketAnalysisResponse = (
  ticketId: string,
  structured: StructuredAnalysis,
  prose: ProseFields,
): TicketAnalysisResponse => ({
  ticket_id: ticketId,
  relevant_transaction_id: structured.relevant_transaction_id,
  evidence_verdict: structured.evidence_verdict,
  case_type: structured.case_type,
  severity: structured.severity,
  department: structured.department,
  agent_summary: prose.agent_summary,
  recommended_next_action: prose.recommended_next_action,
  customer_reply: prose.customer_reply,
  human_review_required: structured.human_review_required,
  confidence: structured.confidence,
  reason_codes: structured.reason_codes,
});
