import type { RequestHandler } from 'express';

import { SemanticValidationError } from '../../errors/SemanticValidationError.js';
import type { AnalyzeTicketRequestDto } from '../schemas/analyze-ticket.schema.js';

/** Post-schema semantic checks — whitespace-only complaint → 422. */
export const validateAnalyzeTicketSemantics = (): RequestHandler => (req, _res, next) => {
  const body = req.body as AnalyzeTicketRequestDto;

  if (typeof body.complaint === 'string' && body.complaint.trim().length === 0) {
    next(
      new SemanticValidationError('complaint must not be empty', {
        fields: [{ path: 'complaint', message: 'complaint must not be empty' }],
      }),
    );
    return;
  }

  next();
};
