import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — Authentication Hardening', () => {
  it('1. Missing Authorization header → 401 AUTHENTICATION_REQUIRED', async () => {
    const res = await request(app).get('/api/v1/issues');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('2. Malformed Bearer token → 401', async () => {
    const res = await request(app)
      .get('/api/v1/issues')
      .set('Authorization', 'Bearer not-a-real-jwt');
    expect(res.status).toBe(401);
  });

  it('3. Expired token format → 401', async () => {
    const fakeExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlIiwiZW1haWwiOiJmYWtlQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid';
    const res = await request(app)
      .get('/api/v1/issues')
      .set('Authorization', `Bearer ${fakeExpiredToken}`);
    expect(res.status).toBe(401);
  });

  it('4. Auth error response must NOT expose JWT_SECRET or token value', async () => {
    const res = await request(app)
      .get('/api/v1/issues')
      .set('Authorization', 'Bearer bad-token');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/jwt_secret/i);
    expect(body).not.toMatch(/secret/i);
    expect(body).not.toContain('bad-token');
  });

  it('5. Login response must NOT contain passwordHash', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@system.local', password: 'Password123!' });
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/passwordHash/i);
    expect(body).not.toMatch(/"hash"/i);
    expect(body).not.toMatch(/bcrypt/i);
  });

  it('6. Login response must NOT return raw password field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@system.local', password: 'Password123!' });
    if (res.status === 200 && res.body.data?.user) {
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    }
  });
});
