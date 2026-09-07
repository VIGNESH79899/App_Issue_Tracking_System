export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DEVELOPER = 'DEVELOPER',
  REPORTER = 'REPORTER',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IssueSeverity {
  COSMETIC = 'COSMETIC',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
  BLOCKER = 'BLOCKER',
}

export enum HistoryAction {
  ISSUE_CREATED = 'ISSUE_CREATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNED = 'ASSIGNED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  SEVERITY_CHANGED = 'SEVERITY_CHANGED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
  ISSUE_UPDATED = 'ISSUE_UPDATED',
  ISSUE_RESOLVED = 'ISSUE_RESOLVED',
  ISSUE_REOPENED = 'ISSUE_REOPENED',
  ISSUE_CLOSED = 'ISSUE_CLOSED',
}

export enum NotificationType {
  ISSUE_ASSIGNED = 'ISSUE_ASSIGNED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM',
}

export enum SlaStatus {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  BREACHED = 'BREACHED',
  COMPLETED_SLA_MET = 'COMPLETED_SLA_MET',
  COMPLETED_SLA_BREACHED = 'COMPLETED_SLA_BREACHED',
}

export enum ProjectHealth {
  HEALTHY = 'HEALTHY',
  AT_RISK = 'AT_RISK',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  DETECTED = 'DETECTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  INVESTIGATING = 'INVESTIGATING',
  MITIGATING = 'MITIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IncidentSeverity {
  SEV1 = 'SEV1',
  SEV2 = 'SEV2',
  SEV3 = 'SEV3',
  SEV4 = 'SEV4',
}

export enum EscalationLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ForecastPeriod {
  D7 = '7D',
  D14 = '14D',
  D30 = '30D',
}

export enum ForecastConfidence {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
}

export enum ForecastDirection {
  IMPROVING = 'IMPROVING',
  STABLE = 'STABLE',
  DETERIORATING = 'DETERIORATING',
}

export const ALLOWED_STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  [IssueStatus.OPEN]: [IssueStatus.ASSIGNED, IssueStatus.CLOSED],
  [IssueStatus.ASSIGNED]: [IssueStatus.IN_PROGRESS, IssueStatus.OPEN, IssueStatus.CLOSED],
  [IssueStatus.IN_PROGRESS]: [IssueStatus.RESOLVED, IssueStatus.ASSIGNED, IssueStatus.CLOSED],
  [IssueStatus.RESOLVED]: [IssueStatus.VERIFIED, IssueStatus.REOPENED, IssueStatus.CLOSED],
  [IssueStatus.VERIFIED]: [IssueStatus.CLOSED, IssueStatus.REOPENED],
  [IssueStatus.CLOSED]: [IssueStatus.REOPENED],
  [IssueStatus.REOPENED]: [IssueStatus.IN_PROGRESS, IssueStatus.ASSIGNED, IssueStatus.CLOSED],
};
