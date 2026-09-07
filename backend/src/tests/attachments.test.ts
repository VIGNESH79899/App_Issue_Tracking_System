import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Attachments API (/api/v1/attachments)', () => {
  it('should return 401 when fetching attachments without authorization', async () => {
    const res = await request(app).get('/api/v1/issues/test-issue-id/attachments');
    expect(res.status).toBe(401);
  });

  it('should return 401 when uploading attachment without authorization', async () => {
    const res = await request(app)
      .post('/api/v1/issues/test-issue-id/attachments')
      .attach('file', Buffer.from('test file content'), 'test.txt');

    expect(res.status).toBe(401);
  });

  it('should return 401 when deleting attachment without authorization', async () => {
    const res = await request(app).delete('/api/v1/attachments/test-attachment-id');
    expect(res.status).toBe(401);
  });
});
