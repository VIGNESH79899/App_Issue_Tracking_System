import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

interface RequestLog {
  timestamps: number[];
}

const requestMap = new Map<string, RequestLog>();

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, log] of requestMap.entries()) {
    log.timestamps = log.timestamps.filter((t) => now - t < 60000);
    if (log.timestamps.length === 0) {
      requestMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const aiRateLimiter = (req: Request, _res: Response, next: NextFunction): void => {
  const userId = req.user?.userId || req.ip;
  const issueId = req.params.id || 'global';
  const key = `ai_rate_${userId}_${issueId}`;

  const limit = env.AI_RATE_LIMIT_PER_MIN || 10;
  const windowMs = 60 * 1000;
  const now = Date.now();

  let log = requestMap.get(key);
  if (!log) {
    log = { timestamps: [] };
    requestMap.set(key, log);
  }

  log.timestamps = log.timestamps.filter((t) => now - t < windowMs);

  if (log.timestamps.length >= limit) {
    return next(
      new ApiError(
        429,
        'TOO_MANY_REQUESTS',
        `AI rate limit exceeded. Maximum ${limit} requests per minute allowed. Please try again shortly.`
      )
    );
  }

  log.timestamps.push(now);
  next();
};
