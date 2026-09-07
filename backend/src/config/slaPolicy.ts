import { IssuePriority } from '@app-issue-track/shared';

export interface SlaPolicyItem {
  responseHours: number;
  resolutionHours: number;
}

export const SLA_POLICY_CONFIG: Record<IssuePriority, SlaPolicyItem> = {
  [IssuePriority.CRITICAL]: {
    responseHours: 1,
    resolutionHours: 4,
  },
  [IssuePriority.HIGH]: {
    responseHours: 4,
    resolutionHours: 24,
  },
  [IssuePriority.MEDIUM]: {
    responseHours: 8,
    resolutionHours: 72,
  },
  [IssuePriority.LOW]: {
    responseHours: 24,
    resolutionHours: 168,
  },
};

export function getSlaPolicy(priority: IssuePriority): SlaPolicyItem {
  return SLA_POLICY_CONFIG[priority] || SLA_POLICY_CONFIG[IssuePriority.MEDIUM];
}
