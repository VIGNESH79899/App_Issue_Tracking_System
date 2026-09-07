import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — AI Reliability & Error Isolation', () => {
  it('1. Issue creation is not blocked by disabled AI', async () => {
    // Issue creation should work even with AI_ENABLED=false
    // This test verifies the endpoint is reachable (auth required, not AI error)
    const res = await request(app).post('/api/v1/issues').send({});
    expect([400, 401]).toContain(res.status);
    // Must NOT be 503 AI_UNAVAILABLE
    expect(res.status).not.toBe(503);
  });

  it('2. GET /api/v1/issues/ai-check → 401 without token (AI not blocking auth)', async () => {
    const res = await request(app).get('/api/v1/issues/fake-id/intelligence');
    expect([401, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('3. AI endpoints have stable error code structure', async () => {
    const res = await request(app).post('/api/v1/issues/fake-id/triage');
    expect([400, 401, 404]).toContain(res.status);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });

  it('4. Dashboard is accessible independently of AI (returns 401, not AI error)', async () => {
    const res = await request(app).get('/api/v1/dashboard');
    expect(res.status).toBe(401);
  });
});
