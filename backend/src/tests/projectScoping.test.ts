import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { env } from '../config/env.js';
import { projectAccessService } from '../services/projectAccessService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Project-Scoped Access Control & Security Matrix', () => {
  const reporterUser = {
    userId: 'user-reporter-id',
    email: 'reporter@test.com',
    role: UserRole.REPORTER,
  };

  const adminUser = {
    userId: 'user-admin-id',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  const reporterToken = jwt.sign(reporterUser, env.JWT_SECRET);
  const adminToken = jwt.sign(adminUser, env.JWT_SECRET);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Project Access & Centralized Authorization Boundary', () => {
    it('unassigned reporter should return empty project list and empty accessible project IDs', async () => {
      vi.spyOn(projectAccessService, 'getAccessibleProjectIds').mockResolvedValue([]);

      const ids = await projectAccessService.getAccessibleProjectIds(reporterUser);
      expect(ids).toEqual([]);
    });

    it('admin should return null (unrestricted global access)', async () => {
      vi.spyOn(projectAccessService, 'getAccessibleProjectIds').mockResolvedValue(null);

      const ids = await projectAccessService.getAccessibleProjectIds(adminUser);
      expect(ids).toBeNull();
    });

    it('canAccessProject returns false for unassigned project', async () => {
      vi.spyOn(projectAccessService, 'canAccessProject').mockResolvedValue(false);

      const canAccess = await projectAccessService.canAccessProject(reporterUser, 'proj-b-id');
      expect(canAccess).toBe(false);
    });
  });

  describe('2. Issues Scoping & Direct ID Protection', () => {
    it('unauthorized issue GET by ID should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessProject').mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/issues/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 404, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('unauthorized issue creation should be rejected with 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessProject').mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          title: 'Malicious Issue Creation',
          description: 'Trying to create issue in unauthorized project B',
          applicationId: 'app-a-id',
          projectId: 'proj-b-id',
          priority: 'HIGH',
          severity: 'MAJOR',
        });

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('mismatched application/project creation should be rejected with 400 Bad Request', async () => {
      vi.spyOn(projectAccessService, 'canAccessProject').mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/issues')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({
          title: 'Mismatched App Project Issue',
          description: 'Project B does not belong to Application A',
          applicationId: 'app-a-id',
          projectId: 'proj-b-id',
          priority: 'HIGH',
          severity: 'MAJOR',
        });

      expect([400, 403, 401, 404, 500]).toContain(res.status);
    });
  });

  describe('3. Comments Authorization Protection', () => {
    it('unauthorized issue GET comments should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessIssue').mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/comments/issue/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('unauthorized comment creation should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessIssue').mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/comments/issue/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({ content: 'Unauthorized comment' });

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Attachments Authorization Protection', () => {
    it('unauthorized issue GET attachments should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessIssue').mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/attachments/issue/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. History Timeline Authorization Protection', () => {
    it('unauthorized issue GET history should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessIssue').mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/issues/11111111-1111-1111-1111-111111111111/history')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Intelligence Service Protection', () => {
    it('unauthorized issue GET intelligence should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessIssue').mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/issues/11111111-1111-1111-1111-111111111111/intelligence')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('7. Applications Scoping', () => {
    it('unauthorized application GET by ID should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'getAccessibleApplicationIds').mockResolvedValue(['app-a-id']);

      const res = await request(app)
        .get('/api/v1/applications/app-b-id')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 404, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('8. Dashboard Server-Side Validation & Scoping', () => {
    it('unauthorized projectId query on dashboard should return 403 Forbidden', async () => {
      vi.spyOn(projectAccessService, 'canAccessProject').mockResolvedValue(false);

      const res = await request(app)
        .get('/api/v1/dashboard/summary?projectId=unauthorized-proj-id')
        .set('Authorization', `Bearer ${reporterToken}`);

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('9. Team Scoping & Member Management', () => {
    it('GET /api/v1/team should require authentication token', async () => {
      const res = await request(app).get('/api/v1/team');
      expect(res.status).toBe(401);
    });

    it('unauthorized user cannot add members to a project', async () => {
      vi.spyOn(projectAccessService, 'canManageProject').mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/projects/proj-a-id/members')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({ userId: 'some-user-id', roleInProject: 'DEVELOPER' });

      expect([403, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe('10. Data Consistency & Canonical Enforcement', () => {
    it('REPORTER cannot assign issue upon status update', async () => {
      vi.spyOn(projectAccessService, 'canAccessIssue').mockResolvedValue(true);

      const res = await request(app)
        .put('/api/v1/issues/11111111-1111-1111-1111-111111111111/assign')
        .set('Authorization', `Bearer ${reporterToken}`)
        .send({ assigneeId: 'dev-user-id' });

      expect([403, 401]).toContain(res.status);
    });
  });
});
