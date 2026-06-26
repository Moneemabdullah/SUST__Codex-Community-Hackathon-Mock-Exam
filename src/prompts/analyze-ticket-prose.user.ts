import type { TicketAnalysisRequest } from '../types/ticket.types.js';
import type { StructuredAnalysis } from '../services/ticket/rules/types.js';

const isBanglaComplaint = (complaint: string, language?: string): boolean =>
  language === 'bn' || /[\u0980-\u09FF]/.test(complaint);

export const buildAnalyzeTicketProseUserPrompt = (
  request: TicketAnalysisRequest,
  structured: StructuredAnalysis,
): string => {
  const lockedFields = {
    ticket_id: request.ticket_id,
    relevant_transaction_id: structured.relevant_transaction_id,
    evidence_verdict: structured.evidence_verdict,
    case_type: structured.case_type,
    severity: structured.severity,
    department: structured.department,
    human_review_required: structured.human_review_required,
    confidence: structured.confidence,
    reason_codes: structured.reason_codes,
  };

  const languageInstruction = isBanglaComplaint(request.complaint, request.language)
    ? 'Write customer_reply in Bangla (Bengali script).'
    : 'Write customer_reply in English.';

  return [
    'Analyze this support ticket and write prose fields only.',
    '',
    `COMPLAINT:\n"""${request.complaint}"""`,
    '',
    `LANGUAGE: ${request.language ?? 'en'}`,
    `CHANNEL: ${request.channel ?? 'unknown'}`,
    `USER TYPE: ${request.user_type ?? 'unknown'}`,
    request.campaign_context ? `CAMPAIGN: ${request.campaign_context}` : '',
    '',
    `TRANSACTION HISTORY (${request.transaction_history.length}):\n${JSON.stringify(request.transaction_history, null, 2)}`,
    '',
    'LOCKED STRUCTURED ANALYSIS (read-only — do not change):',
    JSON.stringify(lockedFields, null, 2),
    '',
    languageInstruction,
    'Include the relevant transaction ID in prose when it is not null.',
    'Return strict JSON with agent_summary, recommended_next_action, and customer_reply only.',
  ]
    .filter(Boolean)
    .join('\n');
};
