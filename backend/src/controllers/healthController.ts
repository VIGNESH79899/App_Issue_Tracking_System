import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { checkDatabaseHealth } from '../observability/databaseHealth.js';
import { prisma } from '../config/database.js';
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

// GET /api/v1/health/debug — Diagnostic endpoint to inspect database schema & runtime environment
export const checkDebug = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rawTables: any = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    const tables = Array.isArray(rawTables) ? rawTables.map((t: any) => t.table_name) : [];
    let userCount = -1;
    let userQueryError = null;
    try {
      userCount = await prisma.user.count();
    } catch (e: any) {
      userQueryError = e.message;
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      tables,
      userCount,
      userQueryError,
      envInfo: {
        nodeEnv: env.NODE_ENV,
        hasJwtSecret: Boolean(env.JWT_SECRET),
        jwtSecretLength: env.JWT_SECRET?.length || 0,
        hasDbUrl: Boolean(env.DATABASE_URL),
        dbHost: env.DATABASE_URL.includes('@') ? env.DATABASE_URL.split('@')[1]?.split('/')[0] : 'local',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
};

// POST /api/v1/health/init-db — Initialize database schema & seeds on demand
export const initDatabase = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { execSync } = await import('child_process');
    console.log('🔄 Initializing database schema via db push...');
    const pushOutput = execSync(
      'npx --yes prisma db push --schema=database/prisma/schema.prisma --accept-data-loss',
      { encoding: 'utf-8' }
    );
    console.log('🌱 Seeding database...');
    const seedOutput = execSync(
      'npx --yes tsx database/prisma/seed.ts',
      { encoding: 'utf-8' }
    );
    res.json({
      success: true,
      message: 'Database schema pushed and seeded successfully!',
      pushOutput,
      seedOutput,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      stdout: err.stdout?.toString(),
      stderr: err.stderr?.toString(),
    });
  }
};
