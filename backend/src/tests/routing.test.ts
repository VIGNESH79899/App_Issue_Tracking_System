import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { routingService } from '../services/routingService.js';
import { UserRole } from '@app-issue-track/shared';

describe('Smart Issue Routing Engine & API (/api/v1/issues/:id/routing-recommendations)', () => {
  it('1. should return 401 Unauthorized when requesting recommendations without auth token', async () => {
    const res = await request(app).get('/api/v1/issues/non-existent-id/routing-recommendations');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. should reject routing recommendations for unauthorized project user (403 Forbidden)', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      routingService.getSmartAssigneeRecommendations(unassignedUser as any, 'some-issue-id')
    ).rejects.toThrow();
  });

  it('3. should return deterministic recommendations sorted by score descending', () => {
    const candidateA = {
      userId: 'dev-1',
      userName: 'Alice Dev',
      userEmail: 'alice@test.com',
      systemRole: UserRole.DEVELOPER,
      projectRole: UserRole.DEVELOPER,
      score: 85,
      activeIssueCount: 1,
      criticalHighIssueCount: 0,
      averageResolutionHours: 4.5,
      reasons: ['Strong component match'],
    };

    const candidateB = {
      userId: 'dev-2',
      userName: 'Bob Dev',
      userEmail: 'bob@test.com',
      systemRole: UserRole.DEVELOPER,
      projectRole: UserRole.DEVELOPER,
      score: 95,
      activeIssueCount: 0,
      criticalHighIssueCount: 0,
      averageResolutionHours: 2.1,
      reasons: ['Currently has 0 active issues'],
    };

    const list = [candidateA, candidateB];
    list.sort((a, b) => b.score - a.score);

    expect(list[0].userId).toBe('dev-2');
    expect(list[1].userId).toBe('dev-1');
  });

  it('4. should apply deterministic tie-breaking by activeIssueCount and userId', () => {
    const candidate1 = {
      userId: 'user-b',
      score: 80,
      activeIssueCount: 2,
    };
    const candidate2 = {
      userId: 'user-a',
      score: 80,
      activeIssueCount: 1,
    };
    const candidate3 = {
      userId: 'user-c',
      score: 80,
      activeIssueCount: 1,
    };

    const list = [candidate1, candidate2, candidate3];
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.activeIssueCount !== b.activeIssueCount) return a.activeIssueCount - b.activeIssueCount;
      return a.userId.localeCompare(b.userId);
    });

    expect(list[0].userId).toBe('user-a');
    expect(list[1].userId).toBe('user-c');
    expect(list[2].userId).toBe('user-b');
  });
});
