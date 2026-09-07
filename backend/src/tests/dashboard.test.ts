import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Dashboard Analytics API (/api/v1/dashboard)', () => {
  it('should return 401 when fetching dashboard metrics without token', async () => {
    const endpoints = [
      '/api/v1/dashboard/summary',
      '/api/v1/dashboard/issues-by-status',
      '/api/v1/dashboard/issues-by-priority',
      '/api/v1/dashboard/issues-by-severity',
      '/api/v1/dashboard/issues-by-application',
      '/api/v1/dashboard/developer-workload',
      '/api/v1/dashboard/resolution-metrics',
    ];

    for (const endpoint of endpoints) {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    }
  });
});
