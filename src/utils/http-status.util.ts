import { HTTP_STATUS, type HttpStatusCode } from '../constants/http.constants.js';

/**
 * Human-readable status reason phrases. Useful for logs and internal
 * responses — clients should rely on status codes, not phrases.
 */
const REASON_PHRASES: Readonly<Record<HttpStatusCode, string>> = Object.freeze({
  [HTTP_STATUS.OK]: 'OK',
  [HTTP_STATUS.CREATED]: 'Created',
  [HTTP_STATUS.ACCEPTED]: 'Accepted',
  [HTTP_STATUS.NO_CONTENT]: 'No Content',
  [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
  [HTTP_STATUS.NOT_FOUND]: 'Not Found',
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HTTP_STATUS.CONFLICT]: 'Conflict',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HTTP_STATUS.GATEWAY_TIMEOUT]: 'Gateway Timeout',
});

export const reasonPhrase = (status: HttpStatusCode): string => REASON_PHRASES[status] ?? 'Unknown';

export const isClientError = (status: HttpStatusCode): boolean => status >= 400 && status < 500;
export const isServerError = (status: HttpStatusCode): boolean => status >= 500;