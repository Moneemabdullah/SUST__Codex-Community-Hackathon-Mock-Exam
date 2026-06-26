import { describe, expect, it } from 'vitest';

import { NoopProvider } from '../../src/services/ai/providers/noop.provider.js';
import { analyzeStructured } from '../../src/services/ticket/ticket-rules.engine.js';
import { buildProseTemplates } from '../../src/services/ticket/prose-templates.js';
import {
  generateProse,
  parseProseFields,
  stripMarkdownFences,
} from '../../src/services/ticket/ticket-prose.service.js';
import { TicketAnalyzerService } from '../../src/services/ticket/ticket-analyzer.service.js';
import type { TicketAnalysisRequest } from '../../src/types/ticket.types.js';

const sample01: TicketAnalysisRequest = {
  ticket_id: 'TKT-001',
  complaint:
    'I sent 5000 taka to a wrong number around 2pm today. The number was supposed to be 01712345678 but I think I typed it wrong.',
  language: 'en',
  channel: 'in_app_chat',
  user_type: 'customer',
  transaction_history: [
    {
      transaction_id: 'TXN-9101',
      timestamp: '2026-04-14T14:08:22Z',
      type: 'transfer',
      amount: 5000,
      counterparty: '+8801719876543',
      status: 'completed',
    },
  ],
};

const sample07: TicketAnalysisRequest = {
  ticket_id: 'TKT-007',
  complaint:
    'আমি আজ সকালে এজেন্টের কাছে ২০০০ টাকা ক্যাশ ইন করেছি কিন্তু আমার ব্যালেন্সে টাকা আসেনি।',
  language: 'bn',
  channel: 'call_center',
  user_type: 'customer',
  transaction_history: [
    {
      transaction_id: 'TXN-9701',
      timestamp: '2026-04-14T09:30:00Z',
      type: 'cash_in',
      amount: 2000,
      counterparty: 'AGENT-318',
      status: 'pending',
    },
  ],
};

describe('ticket-prose.service', () => {
  it('strips markdown JSON fences before parsing', () => {
    const raw = '```json\n{"agent_summary":"A","recommended_next_action":"B","customer_reply":"C"}\n```';
    expect(stripMarkdownFences(raw)).toBe(
      '{"agent_summary":"A","recommended_next_action":"B","customer_reply":"C"}',
    );
  });

  it('parses valid prose JSON', () => {
    const parsed = parseProseFields(
      JSON.stringify({
        agent_summary: 'Summary.',
        recommended_next_action: 'Next.',
        customer_reply: 'Reply.',
      }),
    );
    expect(parsed).toEqual({
      agent_summary: 'Summary.',
      recommended_next_action: 'Next.',
      customer_reply: 'Reply.',
    });
  });

  it('returns template prose when provider is noop', async () => {
    const structured = analyzeStructured(sample01);
    const prose = await generateProse(sample01, structured, new NoopProvider());

    expect(prose.agent_summary).toContain('TXN-9101');
    expect(prose.customer_reply).toMatch(/PIN|OTP/i);
    expect(prose.recommended_next_action.length).toBeGreaterThan(10);
  });

  it('returns Bangla customer_reply template for SAMPLE-07', async () => {
    const structured = analyzeStructured(sample07);
    const prose = buildProseTemplates(sample07, structured);

    expect(prose.customer_reply).toMatch(/[\u0980-\u09FF]/);
    expect(prose.customer_reply).toContain('TXN-9701');
  });

  it('preserves structured fields from rules engine in analyzer service', async () => {
    const service = new TicketAnalyzerService(new NoopProvider());
    const result = await service.analyze(sample01);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.case_type).toBe('wrong_transfer');
    expect(result.value.evidence_verdict).toBe('consistent');
    expect(result.value.relevant_transaction_id).toBe('TXN-9101');
    expect(result.value.agent_summary.length).toBeGreaterThan(0);
    expect(result.value.customer_reply.length).toBeGreaterThan(0);
  });
});
