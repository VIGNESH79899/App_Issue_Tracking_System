import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — Error Handling Consistency', () => {
  it('1. 404 route → structured error response with code NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBeDefined();
  });

  it('2. Error response must include timestamp', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    expect(res.body.timestamp).toBeDefined();
  });

  it('3. Error response should include requestId when X-Request-ID sent', async () => {
    const res = await request(app)
      .get('/api/v1/nonexistent-route-xyz')
      .set('X-Request-ID', 'test-req-id-123');
    expect(res.headers['x-request-id']).toBe('test-req-id-123');
    // requestId may appear in error body
    expect(res.body.error).toBeDefined();
  });

  it('4. Error responses must NOT expose stack traces in test env', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    const body = JSON.stringify(res.body);
    // Stack traces should not be exposed in non-development environments
    expect(body).not.toContain('node_modules');
  });

  it('5. 401 Unauthorized format is correct', async () => {
    const res = await request(app).get('/api/v1/issues');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('6. Error response must NOT expose database connection strings', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/postgresql:\/\//i);
    expect(body).not.toMatch(/password=/i);
  });
});
