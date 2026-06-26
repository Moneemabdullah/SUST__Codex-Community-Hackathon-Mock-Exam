import type { IController } from '../interfaces/http/IController.js';
import { ok } from '../utils/response.util.js';

export interface MetricsPayload {
  readonly enabled: false;
  readonly reason: string;
}

const metricsController: IController = (_req, res) =>
  ok(res, { enabled: false, reason: 'metrics_disabled' } satisfies MetricsPayload);

export { metricsController };