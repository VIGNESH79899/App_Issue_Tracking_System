import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — Enhanced Health Endpoints', () => {
  it('1. GET /api/v1/health → 200 with status UP or DEGRADED', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('status');
    expect(['UP', 'DEGRADED']).toContain(res.body.data.status);
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('services.database');
  });

  it('2. GET /api/v1/health/live → 200 ALIVE (liveness probe)', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ALIVE');
    expect(res.body.data).toHaveProperty('pid');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('3. GET /api/v1/health/ready → response has checks object', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    // Ready when DB is available; 200 or 503 depending on connectivity
    expect([200, 503]).toContain(res.status);
    expect(res.body.data).toHaveProperty('checks');
    expect(res.body.data.checks).toHaveProperty('database');
    expect(res.body.data.checks).toHaveProperty('ai');
  });

  it('4. GET /api/v1/health/ready → checks must NOT expose secrets', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/password/i);
    expect(body).not.toMatch(/jwt_secret/i);
    expect(body).not.toMatch(/api_key/i);
    expect(body).not.toMatch(/database_url/i);
  });
});
