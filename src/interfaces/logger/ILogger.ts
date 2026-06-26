import type { Logger } from 'pino';

export type ILogger = Logger;

export interface ILoggerFactory {
  create(): ILogger;
  child(bindings: Record<string, unknown>): ILogger;
}