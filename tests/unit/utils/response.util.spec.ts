import { describe, expect, it } from 'vitest';
import { created, fail, ok } from '../../../src/utils/response.util.js';
import { HTTP_STATUS } from '../../../src/constants/http.constants.js';
import { ERROR_CODE } from '../../../src/constants/error.constants.js';

const mockRes = () => {
  const res = {
    statusCode: 0,
    req: { id: 'req-test' } as { id: string },
    body: undefined as unknown,
    contentType: '' as string,
  };
  return {
    ...res,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    type(t: string) {
      this.contentType = t;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
};

describe('response.util', () => {
  it('ok() sets 200 and a success envelope', () => {
    const res = mockRes();
    ok(res, { a: 1 });
    expect(res.statusCode).toBe(HTTP_STATUS.OK);
    expect(res.body).toMatchObject({
      success: true,
      data: { a: 1 },
      meta: { requestId: 'req-test' },
    });
  });

  it('created() sets 201', () => {
    const res = mockRes();
    created(res, { id: 'x' });
    expect(res.statusCode).toBe(HTTP_STATUS.CREATED);
    expect(res.body).toMatchObject({ success: true, data: { id: 'x' } });
  });

  it('fail() sets the requested status and an error envelope', () => {
    const res = mockRes();
    fail(res, HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND, 'missing');
    expect(res.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    expect(res.body).toMatchObject({
      success: false,
      message: 'missing',
      error: { code: ERROR_CODE.NOT_FOUND },
      meta: { requestId: 'req-test' },
    });
  });
});
