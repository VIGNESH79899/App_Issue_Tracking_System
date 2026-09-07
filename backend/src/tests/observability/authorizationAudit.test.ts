import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — Authorization Audit', () => {
  it('1. GET /api/v1/operations/overview → 401 without token', async () => {
    const res = await request(app).get('/api/v1/operations/overview');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/v1/operations/metrics → 401 without token', async () => {
    const res = await request(app).get('/api/v1/operations/metrics');
    expect(res.status).toBe(401);
  });

  it('3. GET /api/v1/operations/security-events → 401 without token', async () => {
    const res = await request(app).get('/api/v1/operations/security-events');
    expect(res.status).toBe(401);
  });

  it('4. GET /api/v1/command-center/project-health → 401 without token', async () => {
    const res = await request(app).get('/api/v1/command-center/project-health');
    expect(res.status).toBe(401);
  });

  it('5. GET /api/v1/analytics/overview → 401 without token', async () => {
    const res = await request(app).get('/api/v1/analytics/overview');
    expect(res.status).toBe(401);
  });

  it('6. GET /api/v1/incidents → 401 without token', async () => {
    const res = await request(app).get('/api/v1/incidents');
    expect(res.status).toBe(401);
  });

  it('7. GET /api/v1/dashboard → 401 without token', async () => {
    const res = await request(app).get('/api/v1/dashboard');
    expect(res.status).toBe(401);
  });

  it('8. GET /api/v1/applications → 401 without token', async () => {
    const res = await request(app).get('/api/v1/applications');
    expect(res.status).toBe(401);
  });

  it('9. GET /api/v1/notifications → 401 without token', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('10. GET /api/v1/team → 401 without token', async () => {
    const res = await request(app).get('/api/v1/team');
    expect(res.status).toBe(401);
  });
});
