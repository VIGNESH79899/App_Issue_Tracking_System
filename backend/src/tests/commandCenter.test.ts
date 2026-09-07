import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('AITS Phase 5 — Engineering Command Center Controller API Tests', () => {
  it('1. should return 401 Unauthorized when requesting overview without auth token', async () => {
    const res = await request(app).get('/api/v1/command-center/overview');
    expect(res.status).toBe(401);
  });

  it('2. should return 401 Unauthorized when requesting health without auth token', async () => {
    const res = await request(app).get('/api/v1/command-center/health');
    expect(res.status).toBe(401);
  });

  it('3. should return 401 Unauthorized when requesting trends without auth token', async () => {
    const res = await request(app).get('/api/v1/command-center/trends');
    expect(res.status).toBe(401);
  });

  it('4. should return 401 Unauthorized when requesting briefing without auth token', async () => {
    const res = await request(app).get('/api/v1/command-center/briefing');
    expect(res.status).toBe(401);
  });
});
