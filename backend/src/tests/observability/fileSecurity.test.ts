import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('AITS Phase 9 — File Upload Security', () => {
  it('1. POST /api/v1/attachments/upload → 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/attachments/upload')
      .attach('file', Buffer.from('test'), { filename: 'test.txt', contentType: 'text/plain' });
    expect(res.status).toBe(401);
  });

  it('2. Upload route must not be accessible without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/attachments/upload')
      .send({ filename: 'test.txt' });
    expect([400, 401, 403]).toContain(res.status);
    expect(res.status).not.toBe(200);
  });

  it('3. Upload response must never expose filesystem paths', async () => {
    const res = await request(app)
      .post('/api/v1/attachments/upload')
      .attach('file', Buffer.from('test'), { filename: 'test.txt', contentType: 'text/plain' });
    const body = JSON.stringify(res.body);
    // Paths should not be in error responses
    expect(body).not.toMatch(/C:\\Users\\/);
    expect(body).not.toMatch(/\/home\//);
  });
});
