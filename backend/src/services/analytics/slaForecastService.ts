import {
  SlaForecast,
  ForecastConfidence,
  IssuePriority,
  IssueSeverity,
  IssueStatus,
} from '@app-issue-track/shared';
import { prisma } from '../../config/database.js';
import { slaService } from '../slaService.js';
import { projectAccessService } from '../projectAccessService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { backlogForecastService } from './backlogForecastService.js';
import { ACTIVE_ISSUE_STATUSES, deriveConfidence, deriveDirection } from './analyticsMath.js';

type SlaForecastIssue = {
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  createdAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  dueDate: Date | null;
};

export function buildSlaForecast(
  issues: SlaForecastIssue[],
  projectedBacklog: { forecast7Days: number; forecast14Days: number; forecast30Days: number }
): SlaForecast {
  const activeIssues = issues.filter((issue) => ACTIVE_ISSUE_STATUSES.includes(issue.status));

  if (issues.length === 0) {
    return {
      currentCompliancePercentage: 100,
      forecast7Days: 100,
      forecast14Days: 100,
      forecast30Days: 100,
      direction: deriveDirection(0),
      confidence: ForecastConfidence.INSUFFICIENT_DATA,
      expectedAtRiskIssues: 0,
      expectedBreachedIssues: 0,
      explanation: ['CURRENT FACT: no issues exist in this project, so there is no SLA forecast sample.'],
    };
  }

  let breachedCount = 0;
  let atRiskCount = 0;
  let completedSampleCount = 0;
  let completedBreaches = 0;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (const issue of issues) {
    const sla = slaService.calculateSlaForIssue(issue as never);
    const isBreached =
      sla.responseStatus === 'BREACHED' ||
      sla.resolutionStatus === 'BREACHED' ||
      sla.responseStatus === 'COMPLETED_SLA_BREACHED' ||
      sla.resolutionStatus === 'COMPLETED_SLA_BREACHED';
    const isAtRisk = sla.responseStatus === 'AT_RISK' || sla.resolutionStatus === 'AT_RISK';

    if (ACTIVE_ISSUE_STATUSES.includes(issue.status)) {
      if (isBreached) {
        breachedCount += 1;
      } else if (isAtRisk) {
        atRiskCount += 1;
      }
    }

    const completedAt = issue.resolvedAt || issue.closedAt;
    if (completedAt && completedAt >= thirtyDaysAgo) {
      completedSampleCount += 1;
      if (isBreached) {
        completedBreaches += 1;
      }
    }
  }

  const activeCount = activeIssues.length;
  const currentCompliancePercentage =
    activeCount === 0 ? 100 : Math.round(((activeCount - breachedCount) / activeCount) * 100);
  const historicalBreachRate =
    completedSampleCount > 0 ? completedBreaches / completedSampleCount : breachedCount / Math.max(1, activeCount);
  const atRiskRate = atRiskCount / Math.max(1, activeCount);
  const expectedBreachRate = Math.min(1, Math.max(historicalBreachRate, atRiskRate));

  const forecast7DaysBreaches = Math.min(
    projectedBacklog.forecast7Days,
    Math.round(projectedBacklog.forecast7Days * expectedBreachRate)
  );
  const forecast14DaysBreaches = Math.min(
    projectedBacklog.forecast14Days,
    Math.round(projectedBacklog.forecast14Days * expectedBreachRate)
  );
  const forecast30DaysBreaches = Math.min(
    projectedBacklog.forecast30Days,
    Math.round(projectedBacklog.forecast30Days * expectedBreachRate)
  );
  const forecast7Days =
    projectedBacklog.forecast7Days === 0
      ? 100
      : Math.round(((projectedBacklog.forecast7Days - forecast7DaysBreaches) / projectedBacklog.forecast7Days) * 100);
  const forecast14Days =
    projectedBacklog.forecast14Days === 0
      ? 100
      : Math.round(
          ((projectedBacklog.forecast14Days - forecast14DaysBreaches) / projectedBacklog.forecast14Days) * 100
        );
  const forecast30Days =
    projectedBacklog.forecast30Days === 0
      ? 100
      : Math.round(
          ((projectedBacklog.forecast30Days - forecast30DaysBreaches) / projectedBacklog.forecast30Days) * 100
        );

  const direction = deriveDirection((currentCompliancePercentage - forecast14Days) / 100, 0.03);
  const confidence = deriveConfidence(activeCount + completedSampleCount, activeCount + completedSampleCount);

  return {
    currentCompliancePercentage,
    forecast7Days,
    forecast14Days,
    forecast30Days,
    direction,
    confidence,
    expectedAtRiskIssues:
      projectedBacklog.forecast14Days === 0
        ? 0
        : Math.min(projectedBacklog.forecast14Days, Math.round(projectedBacklog.forecast14Days * atRiskRate)),
    expectedBreachedIssues: forecast14DaysBreaches,
    explanation: [
      `CURRENT FACT: ${activeCount} active issues with ${atRiskCount} at risk and ${breachedCount} already breached.`,
      `DETERMINISTIC CALCULATION: expected breach rate = max(30-day completed breach rate ${Math.round(
        historicalBreachRate * 100
      )}%, current at-risk rate ${Math.round(atRiskRate * 100)}%).`,
      'FORECAST: future compliance = projected backlog minus projected breached issues, divided by projected backlog.',
    ],
  };
}

export class SlaForecastService {
  async forecastSla(currentUser: JwtPayload, projectId: string): Promise<SlaForecast> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const issues = await prisma.issue.findMany({
      where: { projectId },
      select: {
        status: true,
        priority: true,
        severity: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        dueDate: true,
      },
    });
    const backlog = await backlogForecastService.forecastBacklog(currentUser, projectId);
    return buildSlaForecast(issues as SlaForecastIssue[], backlog);
  }
}

export const slaForecastService = new SlaForecastService();
