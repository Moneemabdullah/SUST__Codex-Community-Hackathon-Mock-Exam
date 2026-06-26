import type { Logger } from 'pino';
import type { Application } from 'express';

import { rootLogger } from './infra/logger/pino.logger.js';
import { HealthService } from './services/health.service.js';
import { VersionService } from './services/version.service.js';
import { TicketAnalyzerService } from './services/ticket/ticket-analyzer.service.js';
import { LLMProviderFactory } from './services/ai/llm-provider.factory.js';
import { buildV1Router } from './routes/v1/index.js';
import { buildApiRouter } from './routes/index.js';
import { buildDocsRouter } from './infra/docs/swagger.setup.js';
import { buildExpressApp } from './infra/http/express-app.factory.js';

export interface AppContainer {
  readonly logger: Logger;
  readonly healthService: HealthService;
  readonly versionService: VersionService;
  readonly ticketAnalyzerService: TicketAnalyzerService;
}

/**
 * Composition root. Builds the service graph exactly once at process boot
 * and returns the frozen container. Tests call `buildContainer({ ... })`
 * with overrides to swap individual services or providers.
 */
export interface ContainerOverrides {
  readonly logger?: Logger;
  readonly ticketAnalyzerService?: TicketAnalyzerService;
}

export const buildContainer = (
  overrides: ContainerOverrides = {},
): AppContainer => {
  const logger = overrides.logger ?? rootLogger;

  const llmProviderFactory = new LLMProviderFactory();
  const llmProvider = llmProviderFactory.create();

  const ticketAnalyzerService =
    overrides.ticketAnalyzerService ?? new TicketAnalyzerService(llmProvider);

  return Object.freeze({
    logger,
    healthService: new HealthService(),
    versionService: new VersionService(),
    ticketAnalyzerService,
  });
};

export interface AppGraph {
  readonly container: AppContainer;
  readonly app: Application;
}

/**
 * Builds the full application graph (services + Express app). `main.ts`
 * listens on the returned app; tests can assert against `app` without
 * binding to a port.
 */
export const buildAppGraph = (
  overrides: ContainerOverrides = {},
): AppGraph => {
  const container = buildContainer(overrides);

  const v1Routes = buildV1Router(container.healthService, container.versionService);

  const docsRouter = buildDocsRouter();
  const apiRouter = buildApiRouter({ v1Routes });

  const app = buildExpressApp({ docsRouter, apiRouter });

  return Object.freeze({ container, app });
};