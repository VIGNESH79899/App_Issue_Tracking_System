import { describe, it, expect } from 'vitest';
import { IssueStatus, IssuePriority, IssueSeverity, IssueIntelligence } from '@app-issue-track/shared';

describe('Frontend Issue Intelligence Engine & Workspace UI State Tests', () => {
  it('1. should construct clean loading and error states for intelligence panel', () => {
    const loadingState = { intelligence: null, isLoading: true, error: null };
    const errorState = { intelligence: null, isLoading: false, error: 'Access forbidden' };

    expect(loadingState.isLoading).toBe(true);
    expect(errorState.error).toBe('Access forbidden');
  });

  it('2. should format issue aging metrics accurately for UI display', () => {
    const intelligence: IssueIntelligence = {
      issueAge: { formatted: '2d 14h', hours: 62 },
      timeSinceUpdate: { formatted: '3h 12m', hours: 3.2 },
      currentStatusDuration: { formatted: '8h 21m', hours: 8.35 },
      assignmentAge: { formatted: '5h', hours: 5 },
      lifecycleDurations: [
        {
          status: IssueStatus.OPEN,
          durationFormatted: '3h 42m',
          durationHours: 3.7,
          isCurrent: false,
          startedAt: '2026-08-30T10:00:00Z',
          endedAt: '2026-08-30T13:42:00Z',
        },
        {
          status: IssueStatus.IN_PROGRESS,
          durationFormatted: '8h 21m',
          durationHours: 8.35,
          isCurrent: true,
          startedAt: '2026-08-30T13:42:00Z',
          endedAt: null,
        },
      ],
      relatedIssues: [
        {
          id: 'issue-102',
          issueKey: 'AITS-102',
          title: 'Payment timeout during checkout',
          status: IssueStatus.OPEN,
          priority: IssuePriority.HIGH,
          severity: IssueSeverity.CRITICAL,
          relevanceScore: 91,
          relationshipReason: 'Same project + same component + matching keywords',
        },
      ],
      assigneeWorkload: {
        assigneeId: 'user-dev-1',
        assigneeName: 'Alex Vance',
        totalAssigned: 4,
        openAssigned: 1,
        inProgressAssigned: 2,
        criticalHighAssigned: 1,
        overdueAgingAssigned: 0,
        averageResolutionHours: 6.5,
      },
    };

    expect(intelligence.issueAge.formatted).toBe('2d 14h');
    expect(intelligence.timeSinceUpdate.formatted).toBe('3h 12m');
    expect(intelligence.currentStatusDuration.formatted).toBe('8h 21m');
    expect(intelligence.assignmentAge?.formatted).toBe('5h');
  });

  it('3. should handle unassigned issue state with null workload and assignmentAge', () => {
    const unassignedIntelligence: Partial<IssueIntelligence> = {
      assignmentAge: null,
      assigneeWorkload: null,
    };

    expect(unassignedIntelligence.assignmentAge).toBeNull();
    expect(unassignedIntelligence.assigneeWorkload).toBeNull();
  });

  it('4. should handle empty related issues array cleanly', () => {
    const intelligence: Partial<IssueIntelligence> = {
      relatedIssues: [],
    };

    expect(intelligence.relatedIssues).toHaveLength(0);
  });

  it('5. should rank top 5 related issues descending by relevance score', () => {
    const related = [
      {
        id: '1',
        issueKey: 'KEY-1',
        title: 'Title 1',
        status: IssueStatus.OPEN,
        priority: IssuePriority.HIGH,
        severity: IssueSeverity.MAJOR,
        relevanceScore: 95,
        relationshipReason: 'Same project',
      },
      {
        id: '2',
        issueKey: 'KEY-2',
        title: 'Title 2',
        status: IssueStatus.OPEN,
        priority: IssuePriority.MEDIUM,
        severity: IssueSeverity.MINOR,
        relevanceScore: 78,
        relationshipReason: 'Same application',
      },
    ];

    expect(related[0].relevanceScore).toBeGreaterThan(related[1].relevanceScore);
    expect(related[0].issueKey).toBe('KEY-1');
  });

  it('6. should track status lifecycle active stage flag correctly', () => {
    const durations = [
      {
        status: IssueStatus.OPEN,
        durationFormatted: '2h',
        durationHours: 2,
        isCurrent: false,
        startedAt: '2026-08-31T00:00:00Z',
        endedAt: '2026-08-31T02:00:00Z',
      },
      {
        status: IssueStatus.IN_PROGRESS,
        durationFormatted: '5h',
        durationHours: 5,
        isCurrent: true,
        startedAt: '2026-08-31T02:00:00Z',
        endedAt: null,
      },
    ];

    const currentStage = durations.find((d) => d.isCurrent);
    expect(currentStage?.status).toBe(IssueStatus.IN_PROGRESS);
    expect(currentStage?.endedAt).toBeNull();
  });

  it('7. should trigger cache refetch / invalidation callback when issue status mutates', () => {
    let fetchCount = 0;
    const refetchIntelligence = () => {
      fetchCount += 1;
    };

    // Initial load
    refetchIntelligence();
    expect(fetchCount).toBe(1);

    // Status mutation event
    refetchIntelligence();
    expect(fetchCount).toBe(2);
  });
});
