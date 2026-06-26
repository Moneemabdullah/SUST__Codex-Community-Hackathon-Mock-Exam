import cors from 'cors';
import type { RequestHandler } from 'express';
import { securityConfig } from '../config/security.config.js';

export const corsMiddleware = (): RequestHandler => cors(securityConfig.cors);