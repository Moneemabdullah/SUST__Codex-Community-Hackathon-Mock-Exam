/**
 * Express module augmentation.
 *
 * Adds first-class typing for properties the request-id middleware attaches
 * to every incoming request.
 */
import type { Logger } from 'pino';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
      log: Logger;
      startTime: bigint;
    }
  }
}

export {};
