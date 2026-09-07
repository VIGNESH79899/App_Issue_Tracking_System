import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Projects & Team Members API (/api/v1/projects)', () => {
  it('should return 401 when accessing projects without token', async () => {
    const res = await request(app).get('/api/v1/projects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when creating project without token', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({
        applicationId: '00000000-0000-0000-0000-000000000000',
        name: 'Test Project',
        key: 'TEST',
      });

    expect(res.status).toBe(401);
  });

  it('should return 401 when managing project members without token', async () => {
    const res = await request(app).get('/api/v1/projects/00000000-0000-0000-0000-000000000000/members');
    expect(res.status).toBe(401);
  });
});
