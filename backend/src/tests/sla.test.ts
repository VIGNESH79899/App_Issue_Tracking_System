import { describe, it, expect } from 'vitest';
import { slaService } from '../services/slaService.js';
import { IssuePriority, IssueStatus, SlaStatus, ProjectHealth } from '@app-issue-track/shared';

describe('SLA Engine & Policy Service', () => {
  const fixedNow = new Date('2026-09-01T12:00:00Z');

  it('1. should calculate CRITICAL priority SLA (1h response, 4h resolution) as ON_TRACK within 50% time', () => {
    const createdAt = new Date('2026-09-01T10:00:00Z'); // 2 hours ago (50% of 4h resolution)
    const issue = {
      id: 'issue-crit',
      priority: IssuePriority.CRITICAL,
      status: IssueStatus.OPEN,
      createdAt,
    };

    const metrics = slaService.calculateSlaForIssue(issue, [], fixedNow);

    expect(metrics.responseStatus).toBe(SlaStatus.BREACHED); // 2h > 1h response
    expect(metrics.resolutionStatus).toBe(SlaStatus.ON_TRACK); // 2h / 4h = 50%
    expect(metrics.resolutionRemainingHours).toBe(2);
    expect(metrics.resolutionPercentage).toBe(50);
  });

  it('2. should calculate AT_RISK status when resolution time is between 75% and 99%', () => {
    const createdAt = new Date('2026-09-01T08:30:00Z'); // 3.5 hours ago (3.5 / 4 = 87.5%)
    const issue = {
      id: 'issue-crit-at-risk',
      priority: IssuePriority.CRITICAL,
      status: IssueStatus.IN_PROGRESS,
      createdAt,
    };

    const metrics = slaService.calculateSlaForIssue(issue, [], fixedNow);
    expect(metrics.resolutionStatus).toBe(SlaStatus.AT_RISK);
    expect(metrics.resolutionPercentage).toBe(88);
  });

  it('3. should calculate BREACHED status when resolution time exceeds 100%', () => {
    const createdAt = new Date('2026-09-01T07:00:00Z'); // 5 hours ago (> 4h resolution)
    const issue = {
      id: 'issue-crit-breached',
      priority: IssuePriority.CRITICAL,
      status: IssueStatus.IN_PROGRESS,
      createdAt,
    };

    const metrics = slaService.calculateSlaForIssue(issue, [], fixedNow);
    expect(metrics.resolutionStatus).toBe(SlaStatus.BREACHED);
    expect(metrics.resolutionPercentage).toBe(125);
  });

  it('4. should calculate COMPLETED_SLA_MET for resolved issues within deadline', () => {
    const createdAt = new Date('2026-09-01T08:00:00Z');
    const resolvedAt = new Date('2026-09-01T10:00:00Z'); // 2h resolution (<= 4h)
    const issue = {
      id: 'issue-met',
      priority: IssuePriority.CRITICAL,
      status: IssueStatus.RESOLVED,
      createdAt,
      resolvedAt,
    };

    const metrics = slaService.calculateSlaForIssue(issue, [], fixedNow);
    expect(metrics.resolutionStatus).toBe(SlaStatus.COMPLETED_SLA_MET);
    expect(metrics.isResolutionSlaMet).toBe(true);
  });

  it('5. should calculate COMPLETED_SLA_BREACHED for resolved issues after deadline', () => {
    const createdAt = new Date('2026-09-01T00:00:00Z');
    const resolvedAt = new Date('2026-09-01T06:00:00Z'); // 6h resolution (> 4h)
    const issue = {
      id: 'issue-breached-comp',
      priority: IssuePriority.CRITICAL,
      status: IssueStatus.CLOSED,
      createdAt,
      resolvedAt,
    };

    const metrics = slaService.calculateSlaForIssue(issue, [], fixedNow);
    expect(metrics.resolutionStatus).toBe(SlaStatus.COMPLETED_SLA_BREACHED);
    expect(metrics.isResolutionSlaMet).toBe(false);
  });

  it('6. should return firstResponseAt as null when no response history exists', () => {
    const issue = {
      id: 'issue-no-resp',
      priority: IssuePriority.HIGH,
      status: IssueStatus.OPEN,
      createdAt: new Date('2026-09-01T10:00:00Z'),
    };

    const metrics = slaService.calculateSlaForIssue(issue, [], fixedNow);
    expect(metrics.firstResponseAt).toBeNull();
  });
});
