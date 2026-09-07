import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — Security Headers', () => {
  it('1. Responses must include X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('2. Responses must include X-Frame-Options protection', async () => {
    const res = await request(app).get('/api/v1/health');
    // Helmet sets SAMEORIGIN or DENY
    const xfo = res.headers['x-frame-options'];
    expect(xfo).toBeDefined();
  });

  it('3. X-Request-ID must be echoed back in response header', async () => {
    const customId = 'test-correlation-abc123';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-ID', customId);
    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('4. X-Request-ID must be auto-generated when not provided', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id'].length).toBeGreaterThan(10);
  });

  it('5. Malicious X-Request-ID (injection attempt) must be sanitized', async () => {
    const malicious = 'bad\ninjection\r\ncontent';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-ID', malicious);
    // Header was replaced with a safe UUID
    expect(res.headers['x-request-id']).not.toContain('\n');
    expect(res.headers['x-request-id']).not.toContain('\r');
  });

  it('6. API responses must include Cache-Control: no-store for /api routes', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['cache-control']).toContain('no-store');
  });
});
