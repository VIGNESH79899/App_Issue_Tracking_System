import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — Response Security Audit (No Sensitive Field Leakage)', () => {
  it('1. Health response does not expose DATABASE_URL or JWT_SECRET', async () => {
    const res = await request(app).get('/api/v1/health');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/DATABASE_URL/i);
    expect(body).not.toMatch(/JWT_SECRET/i);
    expect(body).not.toMatch(/GEMINI_API_KEY/i);
    expect(body).not.toMatch(/postgresql:\/\//i);
  });

  it('2. Health/ready does not expose filesystem paths', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/C:\\Users\\/);
    expect(body).not.toMatch(/\/home\//);
    expect(body).not.toMatch(/\/var\//);
  });

  it('3. Error responses do not expose internal Prisma model names', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/PrismaClient/i);
    expect(body).not.toMatch(/prisma\.\w+\.findUnique/i);
  });

  it('4. 401 responses do not expose JWT_SECRET', async () => {
    const res = await request(app)
      .get('/api/v1/issues')
      .set('Authorization', 'Bearer fake.jwt.token');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/secret/i);
    expect(body).not.toMatch(/JWT_SECRET/i);
  });

  it('5. Login error does not include password hash in response', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/\$2[ab]\$/); // bcrypt hash prefix
    expect(body).not.toMatch(/passwordHash/i);
  });

  it('6. Operations response does not contain API keys (unauthenticated check)', async () => {
    const res = await request(app).get('/api/v1/operations/overview');
    expect(res.status).toBe(401);
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/GEMINI_API_KEY/i);
    expect(body).not.toMatch(/jwt_secret/i);
  });
});
