import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { buildAppGraph } from '../../src/container.js';
import { TICKET_ANALYSIS_RESPONSE_KEY_ORDER } from '../../src/services/ticket/build-ticket-analysis-response.js';
import { validateResponse } from '../../src/validators/response.validator.js';
import { loadPublicSamples } from '../helpers/fixtures.js';
import {
  assertBanglaReply,
  assertSafeProse,
  assertStructuredFields,
} from '../helpers/sample-assertions.js';

const sampleCases = loadPublicSamples();

describe('POST /analyze-ticket (judge contract)', () => {
  const { app } = buildAppGraph();

  it.each(sampleCases.map((sample) => [sample.id, sample] as const))(
    '%s structured fields and safe prose',
    async (_id, sample) => {
      const res = await request(app).post('/analyze-ticket').send(sample.input);

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty('success');
      expect(res.body.ticket_id).toBe(sample.input.ticket_id);
      assertStructuredFields(res.body, sample.expected_output);
      assertSafeProse(res.body.customer_reply, res.body.recommended_next_action);
      expect(validateResponse(res.body).valid).toBe(true);
    },
  );

  it('returns response fields in PS §6 key order', async () => {
    const sample = sampleCases[0];
    const res = await request(app).post('/analyze-ticket').send(sample.input);

    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual([...TICKET_ANALYSIS_RESPONSE_KEY_ORDER]);
  });

  it('SAMPLE-07 returns Bangla customer_reply', async () => {
    const sample = sampleCases.find((entry) => entry.id === 'SAMPLE-07');
    expect(sample).toBeDefined();
    if (!sample) {
      return;
    }

    const res = await request(app).post('/analyze-ticket').send(sample.input);
    expect(res.status).toBe(200);
    assertBanglaReply(res.body.customer_reply);
  });

  it('SAMPLE-08 does not guess a transaction', async () => {
    const sample = sampleCases.find((entry) => entry.id === 'SAMPLE-08');
    expect(sample).toBeDefined();
    if (!sample) {
      return;
    }

    const res = await request(app).post('/analyze-ticket').send(sample.input);
    expect(res.status).toBe(200);
    expect(res.body.relevant_transaction_id).toBeNull();
    expect(res.body.evidence_verdict).toBe('insufficient_data');
  });

  it('SAMPLE-10 selects the later duplicate transaction', async () => {
    const sample = sampleCases.find((entry) => entry.id === 'SAMPLE-10');
    expect(sample).toBeDefined();
    if (!sample) {
      return;
    }

    const res = await request(app).post('/analyze-ticket').send(sample.input);
    expect(res.status).toBe(200);
    expect(res.body.relevant_transaction_id).toBe('TXN-10002');
    expect(res.body.case_type).toBe('duplicate_payment');
  });

  it('returns 400 for empty body', async () => {
    const res = await request(app).post('/analyze-ticket').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it('returns 422 for empty complaint', async () => {
    const res = await request(app)
      .post('/analyze-ticket')
      .send({ ticket_id: 'T', complaint: '' });

    expect(res.status).toBe(422);
    expect(res.body).toEqual({ error: 'complaint must not be empty' });
  });

  it('returns 400 for invalid JSON body', async () => {
    const res = await request(app)
      .post('/analyze-ticket')
      .set('Content-Type', 'application/json')
      .send('not-json');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid JSON' });
  });
});
