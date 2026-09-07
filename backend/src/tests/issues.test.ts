import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { IssueStatus } from '@app-issue-track/shared';

describe('Issues & State Machine API (/api/v1/issues)', () => {
  it('should return 401 when fetching issues without authorization header', async () => {
    const res = await request(app).get('/api/v1/issues');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when attempting status change without token', async () => {
    const res = await request(app)
      .patch('/api/v1/issues/test-id/status')
      .send({ status: IssueStatus.RESOLVED });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when attempting assignment without token', async () => {
    const res = await request(app)
      .patch('/api/v1/issues/test-id/assign')
      .send({ assigneeId: 'some-user-id' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
