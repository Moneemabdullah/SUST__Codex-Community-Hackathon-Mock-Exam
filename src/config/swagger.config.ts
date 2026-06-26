import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appConfig } from './app.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SwaggerConfig {
  readonly definition: {
    readonly openapi: '3.0.3';
    readonly info: {
      readonly title: string;
      readonly version: string;
      readonly description: string;
    };
    readonly servers: ReadonlyArray<{ readonly url: string; readonly description: string }>;
    readonly tags: ReadonlyArray<{ readonly name: string; readonly description: string }>;
  };
  readonly apis: readonly string[];
  readonly route: string;
  readonly jsonRoute: string;
}

export const swaggerConfig: Readonly<SwaggerConfig> = Object.freeze({
  definition: {
    openapi: '3.0.3',
    info: {
      title: `${appConfig.name} API`,
      version: appConfig.version,
      description:
        'SUST Codex Community Hackathon — preliminary backend. Stateless ticket analyzer with AI-extensible architecture.',
    },
    servers: [{ url: '/', description: 'Current host' }],
    tags: [
      { name: 'Health', description: 'Liveness and readiness probes' },
      { name: 'Tickets', description: 'Ticket analysis operations' },
    ],
  },
  // JSDoc comments in routes/*.ts are parsed by swagger-jsdoc.
  apis: [path.resolve(__dirname, '../../src/routes/**/*.ts')],
  route: '/docs',
  jsonRoute: '/openapi.json',
});