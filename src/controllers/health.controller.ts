import type { IController } from '../interfaces/http/IController.js';
import { ok } from '../utils/response.util.js';
import { startTimer } from '../utils/timer.util.js';
import type { HealthService } from '../services/health.service.js';

export const buildHealthController =
  (service: HealthService): IController =>
  (_req, res) => {
    const elapsed = startTimer();
    const data = service.snapshot();
    return ok(res, data, { durationMs: elapsed() });
  };