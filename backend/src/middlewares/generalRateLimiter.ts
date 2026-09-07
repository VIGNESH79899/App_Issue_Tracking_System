import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';
import { recordSecurityEvent } from '../observability/securityEvents.js';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  name: string;
}

interface BucketEntry {
  timestamps: number[];
}

function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, BucketEntry>();

  // Cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, 5 * 60 * 1000);

  return function rateLimiter(req: Request, _res: Response, next: NextFunction): void {
    const key = `${config.name}:${req.user?.userId || req.ip}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

    if (entry.timestamps.length >= config.maxRequests) {
      recordSecurityEvent({
        type: 'RATE_LIMIT',
        requestId: req.requestId,
        userId: req.user?.userId,
        route: req.originalUrl,
        method: req.method,
        message: `Rate limit exceeded on ${config.name}`,
      });
      const retryAfterSec = Math.ceil(config.windowMs / 1000);
      _res.setHeader('Retry-After', String(retryAfterSec));
      return next(ApiError.tooManyRequests(`Too many requests. Please retry after ${retryAfterSec} seconds.`));
    }

    entry.timestamps.push(now);
    next();
  };
}

// Authentication endpoints: 10 attempts per minute
export const authRateLimiter = createRateLimiter({
  name: 'auth',
  windowMs: 60 * 1000,
  maxRequests: 10,
});

// Analytics / expensive AI endpoints: 20 per minute per user
export const analyticsRateLimiter = createRateLimiter({
  name: 'analytics',
  windowMs: 60 * 1000,
  maxRequests: 20,
});

// Incident endpoints: 30 per minute per user
export const incidentRateLimiter = createRateLimiter({
  name: 'incident',
  windowMs: 60 * 1000,
  maxRequests: 30,
});

// File upload: 10 per minute per user
export const uploadRateLimiter = createRateLimiter({
  name: 'upload',
  windowMs: 60 * 1000,
  maxRequests: 10,
});
