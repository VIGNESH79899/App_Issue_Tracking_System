import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — CORS Configuration', () => {
  const allowedOrigin = 'http://localhost:5173';
  const unauthorizedOrigin = 'https://evil-site.example.com';

  it('1. Allowed origin receives CORS Access-Control-Allow-Origin header', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', allowedOrigin);
    expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
  });

  it('2. Credentials are enabled for allowed origin', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', allowedOrigin);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('3. Unauthorized origin does not receive Access-Control-Allow-Origin', async () => {
    const res = await request(app)
      .options('/api/v1/health')
      .set('Origin', unauthorizedOrigin)
      .set('Access-Control-Request-Method', 'GET');
    // Should not echo back the unauthorized origin
    expect(res.headers['access-control-allow-origin']).not.toBe(unauthorizedOrigin);
  });

  it('4. X-Request-ID is in exposed headers', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', allowedOrigin);
    const exposed = res.headers['access-control-expose-headers'] ?? '';
    expect(exposed).toContain('X-Request-ID');
  });
});
