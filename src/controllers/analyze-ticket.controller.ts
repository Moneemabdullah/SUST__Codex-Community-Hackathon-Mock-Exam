import type { IController } from '../interfaces/http/IController.js';
import { ValidationError } from '../errors/ValidationError.js';
import { HTTP_STATUS, CONTENT_TYPE } from '../constants/http.constants.js';

/** Minimal stub response until the analyzer pipeline is wired (phase 6). */
const buildStubResponse = (ticketId: string) => ({
  ticket_id: ticketId,
  relevant_transaction_id: null,
  evidence_verdict: 'insufficient_data',
  case_type: 'other',
  severity: 'low',
  department: 'customer_support',
  agent_summary: 'Stub response — analyzer not yet implemented.',
  recommended_next_action: 'Implement rules engine in phase 3.',
  customer_reply:
    'Thank you for reaching out. Please do not share your PIN or OTP with anyone.',
  human_review_required: false,
});

const requireTicketId = (body: unknown): string => {
  if (body === null || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object', {
      fields: [{ path: '', message: 'Expected a JSON object' }],
    });
  }

  const ticketId = (body as Record<string, unknown>).ticket_id;
  if (typeof ticketId !== 'string' || ticketId.trim() === '') {
    throw new ValidationError('ticket_id is required', {
      fields: [{ path: 'ticket_id', message: 'Required non-empty string' }],
    });
  }

  return ticketId.trim();
};

export const buildAnalyzeTicketController = (): IController => (req, res) => {
  const ticketId = requireTicketId(req.body);

  res
    .status(HTTP_STATUS.OK)
    .type(CONTENT_TYPE.JSON)
    .json(buildStubResponse(ticketId));
};
