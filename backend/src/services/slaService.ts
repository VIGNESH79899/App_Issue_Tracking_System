import { IssueStatus, SlaStatus, ProjectHealth, SlaMetrics, ProjectSlaSummary } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { getSlaPolicy } from '../config/slaPolicy.js';
import { projectAccessService } from './projectAccessService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';

export class SlaService {
  calculateSlaForIssue(issue: any, history: any[] = [], nowInput?: Date): SlaMetrics {
    const now = nowInput || new Date();
    const policy = getSlaPolicy(issue.priority);

    const createdAtTime = new Date(issue.createdAt).getTime();
    const responseDeadlineTime = createdAtTime + policy.responseHours * 60 * 60 * 1000;
    const resolutionDeadlineTime = createdAtTime + policy.resolutionHours * 60 * 60 * 1000;

    const responseDeadline = new Date(responseDeadlineTime).toISOString();
    const resolutionDeadline = new Date(resolutionDeadlineTime).toISOString();

    // Determine first response timestamp from real IssueHistory
    let firstResponseAtDate: Date | null = null;
    if (history && history.length > 0) {
      const responseLog = history.find(
        (h) => h.actionType === 'ASSIGNED' || h.fieldChanged === 'assignee' || h.fieldChanged === 'status' || h.actionType === 'COMMENT_ADDED'
      );
      if (responseLog) {
        firstResponseAtDate = new Date(responseLog.createdAt);
      }
    }
    if (!firstResponseAtDate && issue.assigneeId) {
      firstResponseAtDate = new Date(issue.updatedAt || issue.createdAt);
    }
    const firstResponseAt = firstResponseAtDate ? firstResponseAtDate.toISOString() : null;

    // Response SLA calculations
    let responseStatus: SlaStatus = SlaStatus.ON_TRACK;
    let isResponseSlaMet: boolean | null = null;
    let responsePercentage = 0;
    let responseRemainingHours = 0;

    const totalResponseMs = policy.responseHours * 60 * 60 * 1000;

    if (firstResponseAtDate) {
      const responseTimeMs = firstResponseAtDate.getTime() - createdAtTime;
      responsePercentage = Math.min(999, Math.max(0, Math.round((responseTimeMs / totalResponseMs) * 100)));
      isResponseSlaMet = firstResponseAtDate.getTime() <= responseDeadlineTime;
      responseStatus = isResponseSlaMet ? SlaStatus.COMPLETED_SLA_MET : SlaStatus.COMPLETED_SLA_BREACHED;
      responseRemainingHours = Math.round(((responseDeadlineTime - firstResponseAtDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;
    } else {
      const elapsedMs = Math.max(0, now.getTime() - createdAtTime);
      responsePercentage = Math.min(999, Math.round((elapsedMs / totalResponseMs) * 100));
      responseRemainingHours = Math.round(((responseDeadlineTime - now.getTime()) / (1000 * 60 * 60)) * 10) / 10;
      if (responsePercentage >= 100) {
        responseStatus = SlaStatus.BREACHED;
      } else if (responsePercentage >= 75) {
        responseStatus = SlaStatus.AT_RISK;
      } else {
        responseStatus = SlaStatus.ON_TRACK;
      }
    }

    // Resolution SLA calculations
    const isCompleted =
      issue.status === IssueStatus.RESOLVED ||
      issue.status === IssueStatus.VERIFIED ||
      issue.status === IssueStatus.CLOSED ||
      issue.resolvedAt !== null ||
      issue.closedAt !== null;

    let resolvedAtDate: Date | null = null;
    if (issue.resolvedAt) resolvedAtDate = new Date(issue.resolvedAt);
    else if (issue.closedAt) resolvedAtDate = new Date(issue.closedAt);

    let resolutionStatus: SlaStatus = SlaStatus.ON_TRACK;
    let isResolutionSlaMet: boolean | null = null;
    let resolutionPercentage = 0;
    let resolutionRemainingHours = 0;

    const totalResolutionMs = policy.resolutionHours * 60 * 60 * 1000;

    if (isCompleted && resolvedAtDate) {
      const resolutionTimeMs = resolvedAtDate.getTime() - createdAtTime;
      resolutionPercentage = Math.min(999, Math.max(0, Math.round((resolutionTimeMs / totalResolutionMs) * 100)));
      isResolutionSlaMet = resolvedAtDate.getTime() <= resolutionDeadlineTime;
      resolutionStatus = isResolutionSlaMet ? SlaStatus.COMPLETED_SLA_MET : SlaStatus.COMPLETED_SLA_BREACHED;
      resolutionRemainingHours = Math.round(((resolutionDeadlineTime - resolvedAtDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;
    } else {
      const elapsedMs = Math.max(0, now.getTime() - createdAtTime);
      resolutionPercentage = Math.min(999, Math.round((elapsedMs / totalResolutionMs) * 100));
      resolutionRemainingHours = Math.round(((resolutionDeadlineTime - now.getTime()) / (1000 * 60 * 60)) * 10) / 10;
      if (resolutionPercentage >= 100) {
        resolutionStatus = SlaStatus.BREACHED;
      } else if (resolutionPercentage >= 75) {
        resolutionStatus = SlaStatus.AT_RISK;
      } else {
        resolutionStatus = SlaStatus.ON_TRACK;
      }
    }

    return {
      responseDeadline,
      resolutionDeadline,
      responseStatus,
      resolutionStatus,
      responsePercentage,
      resolutionPercentage,
      responseRemainingHours,
      resolutionRemainingHours,
      firstResponseAt,
      resolvedAt: resolvedAtDate ? resolvedAtDate.toISOString() : null,
      isResponseSlaMet,
      isResolutionSlaMet,
    };
  }

  async calculateProjectSlaSummary(
    currentUser: JwtPayload,
    projectId?: string,
    nowInput?: Date
  ): Promise<ProjectSlaSummary> {
    const now = nowInput || new Date();

    if (projectId) {
      const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
      if (!canAccess) {
        throw ApiError.forbidden('You do not have access to this project SLA metrics');
      }
    }

    const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(currentUser);
    if (accessibleProjectIds !== null && accessibleProjectIds.length === 0) {
      return {
        totalActiveIssues: 0,
        compliancePercentage: 100,
        atRiskCount: 0,
        breachedCount: 0,
        avgResponseHours: null,
        avgResolutionHours: null,
        health: ProjectHealth.HEALTHY,
      };
    }

    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    } else if (accessibleProjectIds !== null) {
      where.projectId = { in: accessibleProjectIds };
    }

    const issues = await prisma.issue.findMany({
      where,
      select: {
        id: true,
        projectId: true,
        priority: true,
        severity: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        closedAt: true,
        assigneeId: true,
        history: {
          select: {
            actionType: true,
            fieldChanged: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (issues.length === 0) {
      return {
        totalActiveIssues: 0,
        compliancePercentage: 100,
        atRiskCount: 0,
        breachedCount: 0,
        avgResponseHours: null,
        avgResolutionHours: null,
        health: ProjectHealth.HEALTHY,
      };
    }

    let atRiskCount = 0;
    let breachedCount = 0;
    let activeBreachedCriticalCount = 0;
    let metSlaCount = 0;
    let totalEvaluated = 0;

    let responseHoursSum = 0;
    let responseHoursCount = 0;
    let resolutionHoursSum = 0;
    let resolutionHoursCount = 0;

    for (const issue of issues) {
      const sla = this.calculateSlaForIssue(issue, issue.history, now);
      totalEvaluated++;

      const isResolutionBreached =
        sla.resolutionStatus === SlaStatus.BREACHED || sla.resolutionStatus === SlaStatus.COMPLETED_SLA_BREACHED;
      const isResolutionAtRisk = sla.resolutionStatus === SlaStatus.AT_RISK;

      if (isResolutionBreached) {
        breachedCount++;
        if (
          (issue.priority === 'CRITICAL' || issue.priority === 'HIGH') &&
          issue.status !== 'CLOSED' &&
          issue.status !== 'RESOLVED'
        ) {
          activeBreachedCriticalCount++;
        }
      } else if (isResolutionAtRisk) {
        atRiskCount++;
      } else {
        metSlaCount++;
      }

      if (sla.firstResponseAt) {
        const respHours = (new Date(sla.firstResponseAt).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60);
        responseHoursSum += Math.max(0, respHours);
        responseHoursCount++;
      }

      if (sla.resolvedAt) {
        const resHours = (new Date(sla.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60);
        resolutionHoursSum += Math.max(0, resHours);
        resolutionHoursCount++;
      }
    }

    const compliancePercentage = totalEvaluated > 0 ? Math.round((metSlaCount / totalEvaluated) * 1000) / 10 : 100;
    const avgResponseHours = responseHoursCount > 0 ? Math.round((responseHoursSum / responseHoursCount) * 10) / 10 : null;
    const avgResolutionHours = resolutionHoursCount > 0 ? Math.round((resolutionHoursSum / resolutionHoursCount) * 10) / 10 : null;

    let health = ProjectHealth.HEALTHY;
    if (compliancePercentage < 75 || activeBreachedCriticalCount > 2) {
      health = ProjectHealth.CRITICAL;
    } else if (compliancePercentage < 90 || breachedCount > 0 || atRiskCount > 2) {
      health = ProjectHealth.AT_RISK;
    }

    const activeIssues = issues.filter((i) => i.status !== 'CLOSED' && i.status !== 'RESOLVED');

    return {
      totalActiveIssues: activeIssues.length,
      compliancePercentage,
      atRiskCount,
      breachedCount,
      avgResponseHours,
      avgResolutionHours,
      health,
    };
  }
}

export const slaService = new SlaService();
