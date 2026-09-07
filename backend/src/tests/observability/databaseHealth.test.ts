import { describe, it, expect } from 'vitest';
import { checkDatabaseHealth } from '../../observability/databaseHealth.js';

describe('AITS Phase 9 — Database Health Check', () => {
  it('1. checkDatabaseHealth returns status and latencyMs', async () => {
    const result = await checkDatabaseHealth();
    expect(result).toHaveProperty('status');
    expect(['HEALTHY', 'DEGRADED', 'UNAVAILABLE']).toContain(result.status);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('2. Database health check completes within timeout', async () => {
    const start = Date.now();
    await checkDatabaseHealth();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // Must complete in under 5s
  });

  it('3. Database health result does NOT expose connection string', async () => {
    const result = await checkDatabaseHealth();
    const body = JSON.stringify(result);
    expect(body).not.toMatch(/postgresql:\/\//i);
    expect(body).not.toMatch(/password/i);
  });
});
