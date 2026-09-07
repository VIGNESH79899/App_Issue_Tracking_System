import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { metricsService } from '../observability/metricsService.js';
import { checkDatabaseHealth } from '../observability/databaseHealth.js';
import { getRecentSecurityEvents, getSecurityEventCounts } from '../observability/securityEvents.js';
import { env } from '../config/env.js';

// GET /api/v1/operations/overview — ADMIN ONLY
// Returns full system health + metrics snapshot
export const getOperationsOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [db, metrics, securityCounts] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(metricsService.getSummary()),
      Promise.resolve(getSecurityEventCounts()),
    ]);

    const aiConfigured = env.AI_ENABLED && !!env.GEMINI_API_KEY;

    const data = {
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        startedAt: metrics.startedAt,
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      dependencies: {
        database: {
          status: db.status,
          latencyMs: db.latencyMs,
        },
        storage: {
          status: 'HEALTHY' as const,
          path: '[REDACTED]', // Never expose filesystem path
        },
        ai: {
          status: aiConfigured ? 'CONFIGURED' : 'DISABLED',
          provider: env.AI_PROVIDER,
          model: env.AI_MODEL,
          enabled: env.AI_ENABLED,
        },
      },
      metrics: {
        totalRequests: metrics.totalRequests,
        successfulRequests: metrics.successfulRequests,
        clientErrors: metrics.clientErrors,
        serverErrors: metrics.serverErrors,
        averageResponseMs: metrics.averageResponseMs,
        slowRequests: metrics.slowRequests,
        rateLimitedRequests: metrics.rateLimitedRequests,
        aiRequests: metrics.aiRequests,
        aiFailures: metrics.aiFailures,
        databaseFailures: metrics.databaseFailures,
      },
      security: securityCounts,
      endpointStats: metrics.endpointStats.slice(0, 20), // Top 20 endpoints
    };

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/operations/security-events — ADMIN ONLY
export const getSecurityEventsHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 200);
    const events = getRecentSecurityEvents(limit);

    const response: ApiResponse<typeof events> = {
      success: true,
      data: events,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/operations/metrics — ADMIN ONLY
export const getMetricsHandler = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const summary = metricsService.getSummary();
    const response: ApiResponse<typeof summary> = {
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
