import helmet from 'helmet';
import type { RequestHandler } from 'express';

export const helmetMiddleware = (): RequestHandler => helmet();