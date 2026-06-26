import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { analyzeTicketRequestSchema } from '../../../src/validators/schemas/analyze-ticket.schema.js';
import { analyzeTicketResponseSchema } from '../../../src/validators/schemas/analyze-ticket-response.schema.js';
import {
  CASE_TYPE,
  CHANNEL,
  DEPARTMENT,
  EVIDENCE_VERDICT,
  LANGUAGE,
  SEVERITY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  USER_TYPE,
} from '../../../src/constants/ticket.constants.js';
import { buildAppGraph } from '../../../src/container.js';

const txn = (
  id: string,
  type: (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE],
  status: (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS],
) => ({
  transaction_id: id,
  timestamp: '2024-06-01T10:00:00+06:00',
  type,
  amount: 5000,
  counterparty: '01712345678',
  status,
});

/** Representative inputs aligned with the 10 public sample case shapes. */
const SAMPLE_INPUTS = [
  {
    ticket_id: 'TKT-SAMPLE-01',
    complaint: 'I sent money to the wrong number by mistake.',
    language: LANGUAGE.EN,
    channel: CHANNEL.IN_APP_CHAT,
    user_type: USER_TYPE.CUSTOMER,
    transaction_history: [txn('TXN-001', TRANSACTION_TYPE.TRANSFER, TRANSACTION_STATUS.COMPLETED)],
  },
  {
    ticket_id: 'TKT-SAMPLE-02',
    complaint: 'Payment failed but money was deducted from my account.',
    language: LANGUAGE.EN,
    channel: CHANNEL.CALL_CENTER,
    user_type: USER_TYPE.CUSTOMER,
    transaction_history: [txn('TXN-002', TRANSACTION_TYPE.PAYMENT, TRANSACTION_STATUS.FAILED)],
  },
  {
    ticket_id: 'TKT-SAMPLE-03',
    complaint: 'Please refund my last transaction.',
    language: LANGUAGE.BN,
    channel: CHANNEL.EMAIL,
    user_type: USER_TYPE.CUSTOMER,
    transaction_history: [txn('TXN-003', TRANSACTION_TYPE.REFUND, TRANSACTION_STATUS.PENDING)],
  },
  {
    ticket_id: 'TKT-SAMPLE-04',
    complaint: 'I was charged twice for the same payment.',
    language: LANGUAGE.EN,
    channel: CHANNEL.MERCHANT_PORTAL,
    user_type: USER_TYPE.MERCHANT,
    transaction_history: [
      txn('TXN-004A', TRANSACTION_TYPE.PAYMENT, TRANSACTION_STATUS.COMPLETED),
      txn('TXN-004B', TRANSACTION_TYPE.PAYMENT, TRANSACTION_STATUS.COMPLETED),
    ],
  },
  {
    ticket_id: 'TKT-SAMPLE-05',
    complaint: 'Settlement is delayed for my shop.',
    language: LANGUAGE.EN,
    channel: CHANNEL.MERCHANT_PORTAL,
    user_type: USER_TYPE.MERCHANT,
    transaction_history: [txn('TXN-005', TRANSACTION_TYPE.SETTLEMENT, TRANSACTION_STATUS.PENDING)],
  },
  {
    ticket_id: 'TKT-SAMPLE-06',
    complaint: 'Agent cash-in did not reflect in my wallet.',
    language: LANGUAGE.MIXED,
    channel: CHANNEL.FIELD_AGENT,
    user_type: USER_TYPE.AGENT,
    transaction_history: [txn('TXN-006', TRANSACTION_TYPE.CASH_IN, TRANSACTION_STATUS.PENDING)],
  },
  {
    ticket_id: 'TKT-SAMPLE-07',
    complaint: 'Someone asked for my OTP on a fake support call.',
    language: LANGUAGE.EN,
    channel: CHANNEL.CALL_CENTER,
    user_type: USER_TYPE.CUSTOMER,
    transaction_history: [],
  },
  {
    ticket_id: 'TKT-SAMPLE-08',
    complaint: 'Two similar transfers — not sure which one failed.',
    language: LANGUAGE.EN,
    channel: CHANNEL.IN_APP_CHAT,
    user_type: USER_TYPE.CUSTOMER,
    transaction_history: [
      txn('TXN-008A', TRANSACTION_TYPE.TRANSFER, TRANSACTION_STATUS.COMPLETED),
      txn('TXN-008B', TRANSACTION_TYPE.TRANSFER, TRANSACTION_STATUS.COMPLETED),
    ],
  },
  {
    ticket_id: 'TKT-SAMPLE-09',
    complaint: 'Cash out is still pending after 2 hours.',
    language: LANGUAGE.BN,
    channel: CHANNEL.IN_APP_CHAT,
    user_type: USER_TYPE.CUSTOMER,
    transaction_history: [txn('TXN-009', TRANSACTION_TYPE.CASH_OUT, TRANSACTION_STATUS.PENDING)],
  },
  {
    ticket_id: 'TKT-SAMPLE-10',
    complaint: 'General inquiry about a reversed payment.',
    language: LANGUAGE.EN,
    channel: CHANNEL.EMAIL,
    user_type: USER_TYPE.UNKNOWN,
    transaction_history: [txn('TXN-010', TRANSACTION_TYPE.PAYMENT, TRANSACTION_STATUS.REVERSED)],
  },
] as const;

describe('analyzeTicketRequestSchema', () => {
  it.each(SAMPLE_INPUTS.map((input, i) => [i + 1, input] as const))(
    'parses sample input %i',
    (_index, input) => {
      const result = analyzeTicketRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    },
  );

  it('defaults transaction_history to [] when omitted', () => {
    const result = analyzeTicketRequestSchema.parse({
      ticket_id: 'TKT-001',
      complaint: 'Phishing attempt reported.',
    });
    expect(result.transaction_history).toEqual([]);
  });

  it('rejects empty object', () => {
    const result = analyzeTicketRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing complaint', () => {
    const result = analyzeTicketRequestSchema.safeParse({ ticket_id: 'TKT-X' });
    expect(result.success).toBe(false);
  });

  it('accepts empty complaint string at schema level (semantic layer returns 422)', () => {
    const result = analyzeTicketRequestSchema.safeParse({
      ticket_id: 'TKT-X',
      complaint: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid enum values', () => {
    const result = analyzeTicketRequestSchema.safeParse({
      ticket_id: 'TKT-X',
      complaint: 'test',
      channel: 'sms',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown top-level keys (.strict())', () => {
    const result = analyzeTicketRequestSchema.safeParse({
      ticket_id: 'TKT-X',
      complaint: 'test',
      currency: 'BDT',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid transaction type', () => {
    const result = analyzeTicketRequestSchema.safeParse({
      ticket_id: 'TKT-X',
      complaint: 'test',
      transaction_history: [
        {
          ...txn('TXN-BAD', TRANSACTION_TYPE.TRANSFER, TRANSACTION_STATUS.COMPLETED),
          type: 'wire_transfer',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('analyzeTicketResponseSchema', () => {
  it('parses a complete valid response', () => {
    const result = analyzeTicketResponseSchema.safeParse({
      ticket_id: 'TKT-001',
      relevant_transaction_id: null,
      evidence_verdict: EVIDENCE_VERDICT.INSUFFICIENT_DATA,
      case_type: CASE_TYPE.OTHER,
      severity: SEVERITY.LOW,
      department: DEPARTMENT.CUSTOMER_SUPPORT,
      agent_summary: 'Summary.',
      recommended_next_action: 'Review manually.',
      customer_reply: 'Thank you for contacting us.',
      human_review_required: false,
      confidence: 0.5,
      reason_codes: ['stub'],
    });
    expect(result.success).toBe(true);
  });
});

describe('POST /analyze-ticket validation (API)', () => {
  const { app } = buildAppGraph();

  it('returns 400 for empty body', async () => {
    const res = await request(app).post('/analyze-ticket').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it('returns 422 for empty complaint', async () => {
    const res = await request(app)
      .post('/analyze-ticket')
      .send({ ticket_id: 'TKT-X', complaint: '' });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({ error: 'complaint must not be empty' });
  });

  it('returns 200 for valid request', async () => {
    const res = await request(app)
      .post('/analyze-ticket')
      .send({ ticket_id: 'TKT-001', complaint: 'Something is wrong' });
    expect(res.status).toBe(200);
    expect(res.body.ticket_id).toBe('TKT-001');
  });
});
