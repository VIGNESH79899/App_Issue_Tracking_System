import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 8 — Analytics API Security Tests', () => {
  it('1. GET /api/v1/analytics/overview → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/overview');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/v1/analytics/backlog → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/backlog');
    expect(res.status).toBe(401);
  });

  it('3. GET /api/v1/analytics/sla → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/sla');
    expect(res.status).toBe(401);
  });

  it('4. GET /api/v1/analytics/capacity → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/capacity');
    expect(res.status).toBe(401);
  });

  it('5. GET /api/v1/analytics/components → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/components');
    expect(res.status).toBe(401);
  });

  it('6. GET /api/v1/analytics/incidents → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/incidents');
    expect(res.status).toBe(401);
  });

  it('7. GET /api/v1/analytics/delivery-risk → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/delivery-risk');
    expect(res.status).toBe(401);
  });

  it('8. GET /api/v1/analytics/briefing → 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/v1/analytics/briefing');
    expect(res.status).toBe(401);
  });
});
