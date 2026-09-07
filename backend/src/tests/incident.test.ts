import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('AITS Phase 6 — Incident Management Controller API Tests', () => {
  it('1. should return 401 Unauthorized when requesting incidents without auth token', async () => {
    const res = await request(app).get('/api/v1/incidents');
    expect(res.status).toBe(401);
  });

  it('2. should return 401 Unauthorized when creating an incident without auth token', async () => {
    const res = await request(app).post('/api/v1/incidents').send({ title: 'Test Incident' });
    expect(res.status).toBe(401);
  });

  it('3. should return 401 Unauthorized when requesting incident metrics without auth token', async () => {
    const res = await request(app).get('/api/v1/incidents/metrics');
    expect(res.status).toBe(401);
  });
});
