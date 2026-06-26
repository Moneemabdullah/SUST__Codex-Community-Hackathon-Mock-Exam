import { z } from 'zod';

import {
  CASE_TYPE,
  DEPARTMENT,
  EVIDENCE_VERDICT,
  SEVERITY,
  enumValues,
} from '../../constants/ticket.constants.js';

/** Problem statement §6 — outbound analyze-ticket response (phase 6 pipeline). */
export const analyzeTicketResponseSchema = z.object({
  ticket_id: z.string().min(1),
  relevant_transaction_id: z.string().nullable(),
  evidence_verdict: z.enum(enumValues(EVIDENCE_VERDICT)),
  case_type: z.enum(enumValues(CASE_TYPE)),
  severity: z.enum(enumValues(SEVERITY)),
  department: z.enum(enumValues(DEPARTMENT)),
  agent_summary: z.string().min(1),
  recommended_next_action: z.string().min(1),
  customer_reply: z.string().min(1),
  human_review_required: z.boolean(),
  confidence: z.number().min(0).max(1).optional(),
  reason_codes: z.array(z.string()).optional(),
});

export type AnalyzeTicketResponseDto = z.infer<typeof analyzeTicketResponseSchema>;
