import pino, { type Logger } from 'pino';
import { loggerConfig } from '../../config/logger.config.js';
import type { ILoggerFactory } from '../../interfaces/logger/ILogger.js';

class PinoLoggerFactory implements ILoggerFactory {
  private readonly root: Logger;

  constructor() {
    this.root = pino(loggerConfig.options);
  }

  public create(): Logger {
    return this.root;
  }

  public child(bindings: Record<string, unknown>): Logger {
    return this.root.child(bindings);
  }
}

export const loggerFactory: ILoggerFactory = new PinoLoggerFactory();

export const rootLogger: Logger = loggerFactory.create();