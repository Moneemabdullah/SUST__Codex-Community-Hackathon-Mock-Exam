import { appConfig } from '../config/app.config.js';

export interface HealthSnapshot {
  status: 'ok';
  uptime: number;
  timestamp: string;
  version: string;
  service: string;
}

/**
 * Stateless, dependency-free health probe. Intentionally cheap: this is
 * called frequently by load balancers and Docker health checks.
 */
export class HealthService {
  public snapshot(): HealthSnapshot {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: appConfig.version,
      service: appConfig.name,
    };
  }
}