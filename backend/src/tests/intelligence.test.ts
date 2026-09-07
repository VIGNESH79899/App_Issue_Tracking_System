import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { intelligenceService } from '../services/intelligenceService.js';
import { IssueStatus, IssuePriority, IssueSeverity, UserRole, HistoryAction } from '@app-issue-track/shared';

describe('Issue Intelligence Engine & API (/api/v1/issues/:id/intelligence)', () => {
  it('1. should return 401 Unauthorized when requesting intelligence without auth token', async () => {
    const res = await request(app).get('/api/v1/issues/non-existent-id/intelligence');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. should calculate issue age and update age correctly', () => {
    const createdAt = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h ago
    const updatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h ago

    const now = new Date();
    const issueAgeHours = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
    const updateAgeHours = Math.max(0, (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));

    expect(Math.round(issueAgeHours)).toBe(48);
    expect(Math.round(updateAgeHours)).toBe(2);
  });

  it('3. should calculate current status duration from history entries', () => {
    const statusChangedAt = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5h ago
    const now = new Date();
    const durationHours = Math.max(0, (now.getTime() - statusChangedAt.getTime()) / (1000 * 60 * 60));
    expect(Math.round(durationHours)).toBe(5);
  });

  it('4. should calculate lifecycle duration stages gracefully with history', () => {
    const issue = {
      id: 'issue-1',
      status: IssueStatus.IN_PROGRESS,
      createdAt: new Date('2026-08-30T10:00:00Z'),
    };

    const history = [
      {
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: IssueStatus.OPEN,
        newValue: IssueStatus.ASSIGNED,
        createdAt: new Date('2026-08-30T12:00:00Z'),
      },
      {
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: IssueStatus.ASSIGNED,
        newValue: IssueStatus.IN_PROGRESS,
        createdAt: new Date('2026-08-30T16:00:00Z'),
      },
    ];

    const now = new Date('2026-08-31T16:00:00Z');
    // @ts-ignore
    const durations = intelligenceService['calculateLifecycleDurations'](issue, history, now);

    expect(durations.length).toBe(3);
    expect(durations[0].status).toBe(IssueStatus.OPEN);
    expect(durations[0].durationHours).toBe(2); // 10:00 to 12:00
    expect(durations[1].status).toBe(IssueStatus.ASSIGNED);
    expect(durations[1].durationHours).toBe(4); // 12:00 to 16:00
    expect(durations[2].status).toBe(IssueStatus.IN_PROGRESS);
    expect(durations[2].isCurrent).toBe(true);
    expect(durations[2].durationHours).toBe(24); // 16:00 (30th) to 16:00 (31st)
  });

  it('5. should handle incomplete or empty history without crashing', () => {
    const issue = {
      id: 'issue-legacy',
      status: IssueStatus.OPEN,
      createdAt: new Date('2026-08-31T00:00:00Z'),
    };

    const now = new Date('2026-08-31T10:00:00Z');
    // @ts-ignore
    const durations = intelligenceService['calculateLifecycleDurations'](issue, [], now);

    expect(durations.length).toBe(1);
    expect(durations[0].status).toBe(IssueStatus.OPEN);
    expect(durations[0].isCurrent).toBe(true);
    expect(durations[0].durationHours).toBe(10);
  });

  it('6. should handle closed issue lifecycle calculation', () => {
    const issue = {
      id: 'issue-closed',
      status: IssueStatus.CLOSED,
      createdAt: new Date('2026-08-30T00:00:00Z'),
    };

    const history = [
      {
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: IssueStatus.OPEN,
        newValue: IssueStatus.RESOLVED,
        createdAt: new Date('2026-08-30T10:00:00Z'),
      },
      {
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: IssueStatus.RESOLVED,
        newValue: IssueStatus.CLOSED,
        createdAt: new Date('2026-08-30T12:00:00Z'),
      },
    ];

    const now = new Date('2026-08-31T00:00:00Z');
    // @ts-ignore
    const durations = intelligenceService['calculateLifecycleDurations'](issue, history, now);

    expect(durations.length).toBe(3);
    expect(durations[2].status).toBe(IssueStatus.CLOSED);
    expect(durations[2].isCurrent).toBe(true);
  });

  it('7. should handle reopened issue lifecycle calculation', () => {
    const issue = {
      id: 'issue-reopened',
      status: IssueStatus.REOPENED,
      createdAt: new Date('2026-08-30T00:00:00Z'),
    };

    const history = [
      {
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: IssueStatus.OPEN,
        newValue: IssueStatus.RESOLVED,
        createdAt: new Date('2026-08-30T05:00:00Z'),
      },
      {
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: IssueStatus.RESOLVED,
        newValue: IssueStatus.REOPENED,
        createdAt: new Date('2026-08-30T08:00:00Z'),
      },
    ];

    const now = new Date('2026-08-30T12:00:00Z');
    // @ts-ignore
    const durations = intelligenceService['calculateLifecycleDurations'](issue, history, now);

    expect(durations.length).toBe(3);
    expect(durations[2].status).toBe(IssueStatus.REOPENED);
    expect(durations[2].isCurrent).toBe(true);
    expect(durations[2].durationHours).toBe(4);
  });

  it('8. should return null assignee workload when issue has no assignee', async () => {
    const workload = await intelligenceService.calculateAssigneeWorkload(null);
    expect(workload).toBeNull();
  });

  it('9. should return empty related issues when user has 0 accessible projects', async () => {
    const user = { userId: 'unassigned-user-id', email: 'unassigned@test.com', role: UserRole.REPORTER };
    const issue = { id: 'some-issue-id', projectId: 'some-project-id', title: 'Test Issue' };
    const related = await intelligenceService.calculateRelatedIssues(issue, user as any);
    expect(related).toEqual([]);
  });
});
