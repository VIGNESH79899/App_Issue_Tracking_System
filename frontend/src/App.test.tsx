import { describe, it, expect } from 'vitest';
import { IssueStatus, IssuePriority, IssueSeverity } from '@app-issue-track/shared';

describe('Frontend SaaS Application Suite', () => {
  it('should validate canonical issue status enums', () => {
    expect(IssueStatus.OPEN).toBe('OPEN');
    expect(IssueStatus.CLOSED).toBe('CLOSED');
    expect(IssueStatus.REOPENED).toBe('REOPENED');
  });

  it('should validate issue priority enums', () => {
    expect(IssuePriority.CRITICAL).toBe('CRITICAL');
    expect(IssuePriority.HIGH).toBe('HIGH');
  });

  it('should validate issue severity enums', () => {
    expect(IssueSeverity.BLOCKER).toBe('BLOCKER');
    expect(IssueSeverity.COSMETIC).toBe('COSMETIC');
  });
});
