import {
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  IssueIntelligence,
  LifecycleDuration,
  RelatedIssue,
  AssigneeWorkloadSummary,
  HistoryAction,
} from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';

export class IntelligenceService {
  private formatDuration(hours: number): string {
    if (hours < 1) {
      const minutes = Math.max(1, Math.round(hours * 60));
      return `${minutes}m`;
    }
    const days = Math.floor(hours / 24);
    const remHours = Math.floor(hours % 24);
    if (days > 0) {
      return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
    }
    const minutes = Math.round((hours - remHours) * 60);
    return minutes > 0 ? `${remHours}h ${minutes}m` : `${remHours}h`;
  }

  async getIssueIntelligence(currentUser: JwtPayload, issueId: string): Promise<IssueIntelligence> {
    // 1. Fetch target issue with project relation
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        projectId: true,
        applicationId: true,
        createdAt: true,
        updatedAt: true,
        assigneeId: true,
        reporterId: true,
        status: true,
        title: true,
        moduleComponent: true,
        priority: true,
        severity: true,
      },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    // 2. Project-scoped security check via projectAccessService
    const canAccess = await projectAccessService.canAccessProject(currentUser, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view intelligence for this issue');
    }

    // 3. Fetch Issue History for aging & lifecycle calculations
    const history = await prisma.issueHistory.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();

    // 4. Aging Calculations
    const issueAgeHours = Math.max(0, (now.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60));
    const updateAgeHours = Math.max(0, (now.getTime() - issue.updatedAt.getTime()) / (1000 * 60 * 60));

    // Calculate current status duration from history logs
    const statusLogs = history.filter(
      (h) => h.actionType === HistoryAction.STATUS_CHANGED || h.fieldChanged === 'status'
    );
    let currentStatusStartTime = issue.createdAt;
    if (statusLogs.length > 0) {
      currentStatusStartTime = statusLogs[statusLogs.length - 1].createdAt;
    }
    const currentStatusDurationHours = Math.max(0, (now.getTime() - currentStatusStartTime.getTime()) / (1000 * 60 * 60));

    // Calculate assignment age (time elapsed since current assignee was assigned)
    let assignmentAge: { formatted: string; hours: number } | null = null;
    if (issue.assigneeId) {
      const assignLogs = history.filter(
        (h) => h.actionType === HistoryAction.ASSIGNED || h.fieldChanged === 'assignee' || h.fieldChanged === 'assigneeId'
      );
      let assignedAt = issue.createdAt;
      if (assignLogs.length > 0) {
        assignedAt = assignLogs[assignLogs.length - 1].createdAt;
      } else if (issue.updatedAt) {
        assignedAt = issue.updatedAt;
      }
      const assignHours = Math.max(0, (now.getTime() - assignedAt.getTime()) / (1000 * 60 * 60));
      assignmentAge = {
        formatted: this.formatDuration(assignHours),
        hours: Math.round(assignHours * 10) / 10,
      };
    }

    // 5. Lifecycle Duration Calculations (Resilient & Non-invented)
    const lifecycleDurations = this.calculateLifecycleDurations(issue, history, now);

    // 6. Related Issues (Pre-filtered with Project-Scoped Access Control)
    const relatedIssues = await this.calculateRelatedIssues(issue, currentUser);

    // 7. Assignee Workload Calculation
    const assigneeWorkload = await this.calculateAssigneeWorkload(issue.assigneeId);

    // 8. SLA Calculations (reusing slaService)
    const sla = slaService.calculateSlaForIssue(issue, history, now);

    return {
      issueAge: {
        formatted: this.formatDuration(issueAgeHours),
        hours: Math.round(issueAgeHours * 10) / 10,
      },
      timeSinceUpdate: {
        formatted: this.formatDuration(updateAgeHours),
        hours: Math.round(updateAgeHours * 10) / 10,
      },
      currentStatusDuration: {
        formatted: this.formatDuration(currentStatusDurationHours),
        hours: Math.round(currentStatusDurationHours * 10) / 10,
      },
      assignmentAge,
      lifecycleDurations,
      relatedIssues,
      assigneeWorkload,
      sla,
    };
  }

  private calculateLifecycleDurations(issue: any, history: any[], now: Date): LifecycleDuration[] {
    const events: { status: IssueStatus; timestamp: Date }[] = [];
    events.push({ status: IssueStatus.OPEN, timestamp: issue.createdAt });

    const statusHistory = history.filter(
      (h) => h.actionType === HistoryAction.STATUS_CHANGED || h.fieldChanged === 'status'
    );

    for (const h of statusHistory) {
      if (h.newValue && Object.values(IssueStatus).includes(h.newValue as IssueStatus)) {
        events.push({
          status: h.newValue as IssueStatus,
          timestamp: h.createdAt,
        });
      }
    }

    const durations: LifecycleDuration[] = [];

    for (let i = 0; i < events.length; i++) {
      const current = events[i];
      const isLast = i === events.length - 1;
      const nextTimestamp = isLast ? now : events[i + 1].timestamp;

      const durHours = Math.max(0, (nextTimestamp.getTime() - current.timestamp.getTime()) / (1000 * 60 * 60));

      durations.push({
        status: current.status,
        durationFormatted: this.formatDuration(durHours),
        durationHours: Math.round(durHours * 10) / 10,
        isCurrent: isLast && current.status === issue.status,
        startedAt: current.timestamp.toISOString(),
        endedAt: isLast ? null : nextTimestamp.toISOString(),
      });
    }

    return durations;
  }

  async calculateRelatedIssues(issue: any, currentUser: JwtPayload): Promise<RelatedIssue[]> {
    const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(currentUser);

    // If accessibleProjectIds is an empty array [], return [] immediately
    if (accessibleProjectIds !== null && accessibleProjectIds.length === 0) {
      return [];
    }

    const where: any = {
      id: { not: issue.id },
      OR: [
        { projectId: issue.projectId },
        { applicationId: issue.applicationId },
      ],
    };

    if (accessibleProjectIds !== null) {
      where.projectId = { in: accessibleProjectIds };
    }

    const candidates = await prisma.issue.findMany({
      where,
      take: 50,
      select: {
        id: true,
        issueKey: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        severity: true,
        applicationId: true,
        projectId: true,
        moduleComponent: true,
      },
    });

    if (candidates.length === 0) {
      return [];
    }

    const titleKeywords = issue.title
      .toLowerCase()
      .split(/\W+/)
      .filter((w: string) => w.length > 3);

    const scored = candidates.map((cand) => {
      let score = 0;
      const reasons: string[] = [];

      if (cand.projectId === issue.projectId) {
        score += 30;
        reasons.push('Same project');
      } else if (cand.applicationId === issue.applicationId) {
        score += 20;
        reasons.push('Same application');
      }

      if (issue.moduleComponent && cand.moduleComponent && issue.moduleComponent.toLowerCase() === cand.moduleComponent.toLowerCase()) {
        score += 20;
        reasons.push('Same component');
      }

      if (cand.priority === issue.priority) {
        score += 15;
        reasons.push('Matching priority');
      }

      if (cand.severity === issue.severity) {
        score += 15;
        reasons.push('Matching severity');
      }

      const candTitle = cand.title.toLowerCase();
      const matchingWords = titleKeywords.filter((w: string) => candTitle.includes(w));
      if (matchingWords.length > 0) {
        score += Math.min(15, matchingWords.length * 5);
        reasons.push('Matching keywords');
      }

      const finalScore = Math.min(95, score);

      return {
        id: cand.id,
        issueKey: cand.issueKey,
        title: cand.title,
        status: cand.status as IssueStatus,
        priority: cand.priority as IssuePriority,
        severity: cand.severity as IssueSeverity,
        relevanceScore: finalScore,
        relationshipReason: reasons.join(' + ') || 'Related system domain',
      };
    });

    // Rank descending by relevance score and return at most top 5
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scored.slice(0, 5);
  }

  async calculateAssigneeWorkload(assigneeId: string | null): Promise<AssigneeWorkloadSummary | null> {
    if (!assigneeId) {
      return null;
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!assignee) {
      return null;
    }

    const assignedIssues = await prisma.issue.findMany({
      where: { assigneeId },
      select: {
        id: true,
        status: true,
        priority: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    const totalAssigned = assignedIssues.length;
    const openAssigned = assignedIssues.filter(
      (i) => i.status === IssueStatus.OPEN || i.status === IssueStatus.REOPENED
    ).length;
    const inProgressAssigned = assignedIssues.filter(
      (i) => i.status === IssueStatus.IN_PROGRESS || i.status === IssueStatus.ASSIGNED
    ).length;
    const criticalHighAssigned = assignedIssues.filter(
      (i) => i.priority === IssuePriority.CRITICAL || i.priority === IssuePriority.HIGH
    ).length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const overdueAgingAssigned = assignedIssues.filter(
      (i) => i.status !== IssueStatus.CLOSED && i.createdAt < sevenDaysAgo
    ).length;

    const resolvedWithTime = assignedIssues.filter((i) => i.resolvedAt !== null);
    let averageResolutionHours: number | null = null;
    if (resolvedWithTime.length > 0) {
      const totalHours = resolvedWithTime.reduce((acc, i) => {
        const hours = (i.resolvedAt!.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60);
        return acc + Math.max(0, hours);
      }, 0);
      averageResolutionHours = Math.round((totalHours / resolvedWithTime.length) * 10) / 10;
    }

    return {
      assigneeId: assignee.id,
      assigneeName: `${assignee.firstName} ${assignee.lastName}`,
      totalAssigned,
      openAssigned,
      inProgressAssigned,
      criticalHighAssigned,
      overdueAgingAssigned,
      averageResolutionHours,
    };
  }
}

export const intelligenceService = new IntelligenceService();
