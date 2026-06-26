import type { HttpStatusCode } from '../constants/http.constants.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type { HttpStatusCode };

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}