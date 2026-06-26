import { describe, expect, it } from 'vitest';

import {
  TICKET_ANALYSIS_RESPONSE_KEY_ORDER,
  buildTicketAnalysisResponse,
} from '../../src/services/ticket/build-ticket-analysis-response.js';

describe('buildTicketAnalysisResponse', () => {
  it('emits fields in PS §6 key order', () => {
    const response = buildTicketAnalysisResponse(
      'TKT-001',
      {
        relevant_transaction_id: 'TXN-9101',
        evidence_verdict: 'consistent',
        case_type: 'wrong_transfer',
        severity: 'high',
        department: 'dispute_resolution',
        human_review_required: true,
        confidence: 0.9,
        reason_codes: ['wrong_transfer', 'transaction_match'],
      },
      {
        agent_summary: 'Summary',
        recommended_next_action: 'Next action',
        customer_reply: 'Reply',
      },
    );

    expect(Object.keys(response)).toEqual([...TICKET_ANALYSIS_RESPONSE_KEY_ORDER]);
  });
});
