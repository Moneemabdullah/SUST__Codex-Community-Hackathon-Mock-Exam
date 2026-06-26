/**
 * Stable HTTP identifiers used throughout the application.
 *
 * These are intentionally tiny primitives — domain-specific HTTP behaviour
 * lives in `utils/http-status.util.ts` and the controllers themselves.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export const CONTENT_TYPE = {
  JSON: 'application/json; charset=utf-8',
  TEXT: 'text/plain; charset=utf-8',
  HTML: 'text/html; charset=utf-8',
} as const;

export const HEADER = {
  REQUEST_ID: 'X-Request-Id',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
} as const;