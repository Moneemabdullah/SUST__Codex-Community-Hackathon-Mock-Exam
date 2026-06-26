import swaggerJSDoc, { type Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import type { JsonObject } from 'swagger-ui-express';
import { swaggerConfig } from '../../config/swagger.config.js';

const options: Options = {
  definition: swaggerConfig.definition as Options['definition'],
  apis: [...swaggerConfig.apis],
};

export const openApiDocument = swaggerJSDoc(options) as JsonObject;

/**
 * Router exposing Swagger UI at /docs and the raw OpenAPI JSON at /openapi.json.
 *
 * The JSON endpoint lives under the same router so it shares the path-prefix
 * configuration with the UI.
 */
export const buildDocsRouter = (): Router => {
  const router = Router();
  router.get('/openapi.json', (_req, res) => {
    res.type('application/json').send(openApiDocument);
  });
  router.use('/', swaggerUi.serveFiles(openApiDocument), swaggerUi.setup(openApiDocument));
  return router;
};