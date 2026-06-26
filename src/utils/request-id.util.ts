import { v7 as uuidv7 } from 'uuid';
import { HEADER } from '../constants/http.constants.js';
import type { IRequestIdStore } from '../interfaces/middleware/IRequestIdStore.js';

const UUID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

/**
 * Default request-id store. Honours an inbound `X-Request-Id` when it
 * looks safe; otherwise generates a UUID v7 (sortable, time-ordered).
 */
export class RequestIdStore implements IRequestIdStore {
  public readonly headerName = HEADER.REQUEST_ID;

  public generate(): string {
    return uuidv7();
  }

  /**
   * Returns a usable request id, either from the inbound header or a fresh one.
   * Inbound ids are validated to a permissive safe charset to avoid header
   * injection or unbounded values.
   */
  public resolve(inbound: string | string[] | undefined): string {
    const candidate = Array.isArray(inbound) ? inbound[0] : inbound;
    if (candidate && UUID_PATTERN.test(candidate)) return candidate;
    return this.generate();
  }
}

export const defaultRequestIdStore: IRequestIdStore = new RequestIdStore();