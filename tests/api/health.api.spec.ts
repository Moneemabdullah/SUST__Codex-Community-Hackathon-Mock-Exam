import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { buildAppGraph } from '../../src/container.js';

describe('GET /v1/health', () => {
  it('returns 200 and the health envelope', async () => {
    const { app } = buildAppGraph();
    const res = await request(app).get('/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        service: expect.any(String),
        version: expect.any(String),
      },
    });
  });
});
