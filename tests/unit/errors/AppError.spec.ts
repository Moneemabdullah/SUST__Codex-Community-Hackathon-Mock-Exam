import { describe, expect, it } from 'vitest';
import { AppError } from '../../../src/errors/AppError.js';
import { NotFoundError } from '../../../src/errors/NotFoundError.js';
import { ValidationError } from '../../../src/errors/ValidationError.js';
import { RateLimitError } from '../../../src/errors/RateLimitError.js';
import { InternalServerError } from '../../../src/errors/InternalServerError.js';
import { HTTP_STATUS } from '../../../src/constants/http.constants.js';
import { ERROR_CODE } from '../../../src/constants/error.constants.js';

describe('AppError hierarchy', () => {
  it('AppError is throwable and serializes via toJSON()', () => {
    class ConcreteError extends AppError {
      constructor() {
        super('boom', HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODE.INTERNAL_ERROR);
      }
    }
    const err = new ConcreteError();
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(err.code).toBe(ERROR_CODE.INTERNAL_ERROR);
    expect(err.toJSON()).toMatchObject({
      name: 'ConcreteError',
      message: 'boom',
      code: ERROR_CODE.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });

  it('NotFoundError maps to 404', () => {
    const err = new NotFoundError('user not found', { id: '1' });
    expect(err.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    expect(err.code).toBe(ERROR_CODE.NOT_FOUND);
    expect(err.metadata).toMatchObject({ id: '1' });
  });

  it('ValidationError carries field issues', () => {
    const err = new ValidationError('bad', {
      fields: [{ path: 'x', message: 'required' }],
    });
    expect(err.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(err.code).toBe(ERROR_CODE.VALIDATION_FAILED);
    expect(err.metadata).toMatchObject({
      fields: [{ path: 'x', message: 'required' }],
    });
  });

  it('RateLimitError exposes retryAfterSeconds', () => {
    const err = new RateLimitError('slow down', { retryAfterSeconds: 30 });
    expect(err.statusCode).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(err.retryAfterSeconds).toBe(30);
  });

  it('InternalServerError is non-operational', () => {
    const err = new InternalServerError();
    expect(err.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(err.isOperational).toBe(false);
  });
});
