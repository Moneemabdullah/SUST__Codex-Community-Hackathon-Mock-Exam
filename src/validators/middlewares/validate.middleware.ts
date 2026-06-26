import type { RequestHandler } from 'express';
import type { ZodTypeAny, infer as ZodInfer } from 'zod';
import { safeParse } from '../../utils/safe-parse.util.js';

export interface ValidateOptions {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

interface SourceMap {
  body: unknown;
  query: unknown;
  params: unknown;
}

/**
 * Edge-validation middleware. Parses the selected parts of the request
 * with the provided Zod schemas and replaces them in-place with the
 * strongly-typed result. Failures are converted into `ValidationError`
 * (400) so the error middleware can serialise them uniformly.
 */
export const validate = (options: ValidateOptions): RequestHandler => {
  return (req, _res, next) => {
    try {
      const sources: SourceMap = { body: req.body, query: req.query, params: req.params };
      if (options.body) {
        const r = safeParse(options.body, sources.body, { errorMessage: 'Invalid request body' });
        if (!r.ok) return next(r.error);
        req.body = r.value as ZodInfer<typeof options.body>;
      }
      if (options.query) {
        const r = safeParse(options.query, sources.query, { errorMessage: 'Invalid query parameters' });
        if (!r.ok) return next(r.error);
        // Express 5 makes req.query a getter; safest to mutate existing shape.
        Object.assign(req.query, r.value as object);
      }
      if (options.params) {
        const r = safeParse(options.params, sources.params, { errorMessage: 'Invalid path parameters' });
        if (!r.ok) return next(r.error);
        Object.assign(req.params, r.value as object);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};