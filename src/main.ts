import 'dotenv/config';

import { appConfig } from './config/app.config.js';
import { buildAppGraph } from './container.js';
import { buildServer } from './server.js';
import { createGracefulShutdown } from './infra/http/graceful-shutdown.js';

const { container, app } = buildAppGraph();
const logger = container.logger;

const server = buildServer({ app });

server.listen(appConfig.port, appConfig.host, () => {
  logger.info(
    {
      service: appConfig.name,
      version: appConfig.version,
      env: appConfig.nodeEnv,
      instanceId: appConfig.instanceId,
      host: appConfig.host,
      port: appConfig.port,
    },
    `${appConfig.name} listening on http://${appConfig.host}:${appConfig.port}`,
  );
});

server.on('error', (err) => {
  logger.fatal({ err }, 'HTTP server failed to start');
  process.exit(1);
});

const shutdown = createGracefulShutdown(server, logger);
const uninstall = shutdown.install();

const onUnhandledRejection = (reason: unknown): void => {
  logger.fatal({ err: reason }, 'unhandledRejection');
};
const onUncaughtException = (err: unknown): void => {
  logger.fatal({ err }, 'uncaughtException');
  uninstall();
  process.exit(1);
};

process.on('unhandledRejection', onUnhandledRejection);
process.on('uncaughtException', onUncaughtException);