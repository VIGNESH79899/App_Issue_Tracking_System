import { Request, Response, NextFunction } from 'express';
import { logger } from '../observability/logger.js';
import { metricsService } from '../observability/metricsService.js';
import { env } from '../config/env.js';

const SLOW_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '1000', 10);

// Routes/patterns that should never log body details
const SENSITIVE_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    const { method, originalUrl } = req;
    const statusCode = res.statusCode;
    const contentLength = res.get('content-length');
    const requestId = req.requestId;
    const userId = req.user?.userId;

    const isSensitive = SENSITIVE_ROUTES.some((p) => originalUrl.includes(p));

    // Record in metrics
    metricsService.recordRequest({ method, originalUrl, statusCode, durationMs });

    const logMeta = {
      requestId,
      userId: isSensitive ? undefined : userId,
      method,
      route: originalUrl,
      statusCode,
      durationMs,
      ...(contentLength ? { responseSize: parseInt(contentLength, 10) } : {}),
    };

    if (durationMs >= SLOW_THRESHOLD_MS) {
      logger.warn(`SLOW REQUEST ${method} ${originalUrl} ${statusCode} ${durationMs}ms`, logMeta);
    } else if (statusCode >= 500) {
      logger.error(`${method} ${originalUrl} ${statusCode} ${durationMs}ms`, logMeta);
    } else if (statusCode >= 400) {
      logger.warn(`${method} ${originalUrl} ${statusCode} ${durationMs}ms`, logMeta);
    } else if (env.NODE_ENV !== 'test') {
      logger.info(`${method} ${originalUrl} ${statusCode} ${durationMs}ms`, logMeta);
    }
  });

  next();
}
