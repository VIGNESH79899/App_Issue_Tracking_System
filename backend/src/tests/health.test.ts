import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 OK with UP status contract', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('UP');
    expect(response.body.data.services.database).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app).get('/api/v1/unknown-route-endpoint');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
