import type { IController } from '../interfaces/http/IController.js';
import { HTTP_STATUS, CONTENT_TYPE } from '../constants/http.constants.js';
import type { ITicketAnalyzerService } from '../interfaces/services/ITicketAnalyzerService.js';
import type { AnalyzeTicketRequestDto } from '../validators/schemas/analyze-ticket.schema.js';

export const buildAnalyzeTicketController =
  (service: ITicketAnalyzerService): IController =>
  async (req, res, next) => {
    const request = req.body as AnalyzeTicketRequestDto;
    const result = await service.analyze(request);

    if (!result.ok) {
      next(result.error);
      return;
    }

    res.status(HTTP_STATUS.OK).type(CONTENT_TYPE.JSON).json(result.value);
  };
