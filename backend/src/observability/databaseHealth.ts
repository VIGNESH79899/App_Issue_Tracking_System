import { prisma } from '../config/database.js';
import { metricsService } from './metricsService.js';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';

export interface DatabaseHealthResult {
  status: HealthStatus;
  latencyMs: number;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database health check timeout')), 3000)
      ),
    ]);
    return { status: 'HEALTHY', latencyMs: Date.now() - start };
  } catch (err) {
    metricsService.incrementDatabaseFailure();
    return {
      status: 'UNAVAILABLE',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown database error',
    };
  }
}
