import type { IController } from '../interfaces/http/IController.js';
import { HTTP_STATUS, CONTENT_TYPE } from '../constants/http.constants.js';
import type { TicketAnalyzerService } from '../services/ticket/ticket-analyzer.service.js';
import type { AnalyzeTicketRequestDto } from '../validators/schemas/analyze-ticket.schema.js';

export const buildAnalyzeTicketController =
  (service: TicketAnalyzerService): IController =>
  async (req, res) => {
    const request = req.body as AnalyzeTicketRequestDto;
    const result = await service.analyze(request);

    if (!result.ok) {
      throw result.error;
    }

    res.status(HTTP_STATUS.OK).type(CONTENT_TYPE.JSON).json(result.value);
  };
