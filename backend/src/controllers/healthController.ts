import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { checkDatabaseHealth } from '../observability/databaseHealth.js';
import { env } from '../config/env.js';

// GET /api/v1/health — existing general health check (backward-compatible)
export const checkHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const db = await checkDatabaseHealth();

    const healthData = {
      status: db.status === 'HEALTHY' ? 'UP' : 'DEGRADED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: db.status === 'HEALTHY' ? 'CONNECTED' : 'DISCONNECTED',
      },
    };

    const response: ApiResponse<typeof healthData> = {
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/health/live — Kubernetes liveness probe
// Returns 200 if the Node.js process is alive, regardless of dependency state
export const checkLive = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: { status: 'ALIVE', pid: process.pid, uptime: Math.round(process.uptime()) },
    timestamp: new Date().toISOString(),
  });
};

// GET /api/v1/health/ready — Kubernetes readiness probe
// Returns 200 only when critical dependencies are healthy
export const checkReady = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const db = await checkDatabaseHealth();

    const aiConfigured = env.AI_ENABLED && !!env.GEMINI_API_KEY;
    const storageReachable = true; // Local FS assumed available; extend for S3

    const allHealthy = db.status === 'HEALTHY';
    const status = allHealthy ? 'READY' : 'NOT_READY';
    const httpStatus = allHealthy ? 200 : 503;

    const checks = {
      database: db.status,
      storage: storageReachable ? 'HEALTHY' : 'UNAVAILABLE',
      ai: aiConfigured ? 'CONFIGURED' : 'DISABLED',
    };

    res.status(httpStatus).json({
      success: allHealthy,
      data: { status, timestamp: new Date().toISOString(), checks },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
