import { randomUUID } from 'node:crypto';

import { appConfig } from '../config/app.config.js';

export interface VersionInfo {
  readonly service: string;
  readonly version: string;
  readonly environment: string;
  readonly nodeVersion: string;
  readonly instanceId: string;
}

export class VersionService {
  private readonly instanceId: string = randomUUID();

  public info(): VersionInfo {
    return {
      service: appConfig.name,
      version: appConfig.version,
      environment: appConfig.nodeEnv,
      nodeVersion: process.version,
      instanceId: this.instanceId,
    };
  }
}