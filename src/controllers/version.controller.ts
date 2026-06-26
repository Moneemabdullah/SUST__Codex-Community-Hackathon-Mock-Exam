import type { IController } from '../interfaces/http/IController.js';
import { ok } from '../utils/response.util.js';
import type { VersionService } from '../services/version.service.js';

export const buildVersionController =
  (service: VersionService): IController =>
  (_req, res) =>
    ok(res, service.info());