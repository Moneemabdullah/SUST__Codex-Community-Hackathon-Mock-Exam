import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appConfig } from './app.config.js';

const __filename = fileURLToPath(import.meta.url);
const here = path.dirname(__filename);

// /**
//  * Resolve a glob that finds the source route files regardless of whether
//  * the process is running compiled (`dist/config`) or via `tsx` (`src/config`).
//  *
//  * `src/` and `dist/` are kept structurally aligned by `tsconfig.build.json`,
//  * so `../routes/**/.js` (compiled) and `../routes/**/*.ts` (dev) both work.

// **/



const routesGlob = ((): string => {
  const compiledCandidate = path.resolve(here, '../routes/**/*.js');
  const sourceCandidate = path.resolve(here, '../routes/**/*.ts');
  const runningCompiled = here.includes(`${path.sep}dist${path.sep}`);
  return runningCompiled ? compiledCandidate : sourceCandidate;
})();

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
  apis: [routesGlob],
  route: '/docs',
  jsonRoute: '/openapi.json',
});