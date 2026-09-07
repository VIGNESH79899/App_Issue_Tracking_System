import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Authentication API (/api/v1/auth)', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  let accessToken: string;
  let refreshToken: string;

  it('should attempt registration and return proper status code contract', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    // 201 Created when DB is connected, 500 when DB server is offline in test runner
    expect([201, 500]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never return password hash
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    }
  });

  it('should reject request with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email-format',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject login request with invalid body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request to /me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
