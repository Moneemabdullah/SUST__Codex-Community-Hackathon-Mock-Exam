import type { Response } from 'express';
import { CONTENT_TYPE, HTTP_STATUS, type HttpStatusCode } from '../constants/http.constants.js';

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  durationMs?: number;
}

export interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta: ResponseMeta;
}

export interface ErrorDetail {
  code: string;
  details?: unknown;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  error: ErrorDetail;
  meta: ResponseMeta;
}

const buildMeta = (res: Response, durationMs?: number): ResponseMeta => {
  const meta: ResponseMeta = {
    requestId: res.req.id,
    timestamp: new Date().toISOString(),
  };
  if (durationMs !== undefined) meta.durationMs = durationMs;
  return meta;
};

export const ok = <T>(
  res: Response,
  data: T,
  options: { message?: string; statusCode?: HttpStatusCode; durationMs?: number } = {},
): Response<SuccessEnvelope<T>> => {
  const body: SuccessEnvelope<T> = {
    success: true,
    message: options.message ?? 'OK',
    data,
    meta: buildMeta(res, options.durationMs),
  };
  return res
    .status(options.statusCode ?? HTTP_STATUS.OK)
    .type(CONTENT_TYPE.JSON)
    .json(body) as Response<SuccessEnvelope<T>>;
};

export const created = <T>(
  res: Response,
  data: T,
  options: { message?: string; durationMs?: number } = {},
): Response<SuccessEnvelope<T>> =>
  ok(res, data, { ...options, statusCode: HTTP_STATUS.CREATED, message: options.message ?? 'Created' });

export const fail = (
  res: Response,
  statusCode: HttpStatusCode,
  code: string,
  message: string,
  options: { details?: unknown; durationMs?: number } = {},
): Response<ErrorEnvelope> => {
  const error: ErrorDetail = { code };
  if (options.details !== undefined) error.details = options.details;
  const body: ErrorEnvelope = {
    success: false,
    message,
    error,
    meta: buildMeta(res, options.durationMs),
  };
  return res.status(statusCode).type(CONTENT_TYPE.JSON).json(body) as Response<ErrorEnvelope>;
};