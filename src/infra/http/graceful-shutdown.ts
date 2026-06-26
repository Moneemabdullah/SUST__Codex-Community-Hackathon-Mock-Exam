import type { Server } from 'node:http';
import type { Logger } from 'pino';
import { appConfig } from '../../config/app.config.js';

export interface ShutdownHandle {
  /** Installs signal handlers; returns an uninstaller. */
  install(): () => void;
}

/**
 * Wires SIGTERM / SIGINT to a graceful shutdown:
 *   1. server.close() — stop accepting new connections
 *   2. drain in-flight requests up to SHUTDOWN_TIMEOUT_MS
 *   3. flush logger
 *   4. exit(0)
 *
 * PM2 / systemd send SIGTERM first; a second SIGTERM or a timeout
 * escalates to SIGKILL via the process supervisor.
 */
export const createGracefulShutdown = (server: Server, logger: Logger): ShutdownHandle => {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      logger.warn({ signal }, 'shutdown already in progress; ignoring repeated signal');
      return;
    }
    shuttingDown = true;
    logger.info({ signal, timeoutMs: appConfig.shutdownTimeoutMs }, 'graceful shutdown initiated');

    const forceExit = setTimeout(() => {
      logger.error('shutdown timed out; forcing exit');
      process.exit(1);
    }, appConfig.shutdownTimeoutMs);
    forceExit.unref();

    server.close((err) => {
      if (err) {
        logger.error({ err }, 'error while closing HTTP server');
        process.exit(1);
        return;
      }
      logger.info('HTTP server closed; flushing logger and exiting');
      logger.flush?.();
      // Give pino a tick to flush.
      setImmediate(() => process.exit(0));
    });
  };

  return {
    install: () => {
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      return () => {
        process.off('SIGTERM', shutdown);
        process.off('SIGINT', shutdown);
      };
    },
  };
};