import type { IMiddleware } from '../../interfaces/middleware/IMiddleware.js';
import { loggerFactory } from './pino.logger.js';
import { startTimer } from '../../utils/timer.util.js';

/**
 * Attaches `req.log`, `req.id`, and `req.startTime` to every request, then
 * emits one structured log line per request once the response finishes.
 *
 * The request-id middleware must run BEFORE this middleware so `req.id`
 * is already set when we attach the child logger.
 */
export const httpLoggerMiddleware: IMiddleware = (req, res, next) => {
  req.log = loggerFactory.child({ reqId: req.id });
  req.startTime = process.hrtime.bigint();
  const elapsed = startTimer();

  res.on('finish', () => {
    req.log.info(
      {
        method: req.method,
        path: req.originalUrl ?? req.url,
        statusCode: res.statusCode,
        durationMs: elapsed(),
        contentLength: Number(res.getHeader('content-length') ?? 0),
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      },
      'request completed',
    );
  });

  res.on('close', () => {
    // Client aborted before response finished — still useful to know.
    if (!res.writableEnded) {
      req.log.warn({ method: req.method, path: req.originalUrl ?? req.url }, 'request aborted by client');
    }
  });

  next();
};