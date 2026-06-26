import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { buildAppGraph } from '../../src/container.js';

describe('GET /health (judge contract)', () => {
  it('returns raw { status: ok } without envelope', async () => {
    const { app } = buildAppGraph();
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.body).not.toHaveProperty('success');
    expect(res.body).not.toHaveProperty('data');
    expect(res.body).not.toHaveProperty('meta');
  });
});
