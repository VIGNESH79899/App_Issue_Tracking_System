import {
  BacklogForecast,
  BacklogForecastPoint,
  ForecastConfidence,
  IssueStatus,
} from '@app-issue-track/shared';
import { prisma } from '../../config/database.js';
import { projectAccessService } from '../projectAccessService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import {
  ACTIVE_ISSUE_STATUSES,
  countSeriesByDate,
  createDailySeries,
  deriveConfidence,
  deriveDirection,
  forecastCount,
  roundToOneDecimal,
  sum,
  activityDays,
} from './analyticsMath.js';

type ForecastIssue = {
  status: IssueStatus;
  createdAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
};

export function buildBacklogForecast(issues: ForecastIssue[], now = new Date()): BacklogForecast {
  const currentBacklog = issues.filter((issue) => ACTIVE_ISSUE_STATUSES.includes(issue.status)).length;

  if (issues.length === 0) {
    return {
      currentBacklog,
      forecast7Days: 0,
      forecast14Days: 0,
      forecast30Days: 0,
      direction: deriveDirection(0),
      confidence: ForecastConfidence.INSUFFICIENT_DATA,
      points: [],
      explanation: ['CURRENT FACT: no issues exist in this project, so backlog forecast remains at zero.'],
    };
  }

  const createdSeries = countSeriesByDate(
    issues.map((issue) => issue.createdAt),
    30,
    now
  );
  const resolvedSeries = countSeriesByDate(
    issues.map((issue) => issue.resolvedAt || issue.closedAt),
    30,
    now
  );

  const totalCreated = sum(createdSeries);
  const totalResolved = sum(resolvedSeries);
  const activePeriods = activityDays(createdSeries, resolvedSeries);
  const confidence = deriveConfidence(totalCreated + totalResolved, activePeriods);

  if (confidence === ForecastConfidence.INSUFFICIENT_DATA) {
    return {
      currentBacklog,
      forecast7Days: currentBacklog,
      forecast14Days: currentBacklog,
      forecast30Days: currentBacklog,
      direction: deriveDirection(0),
      confidence,
      points: [],
      explanation: [
        'CURRENT FACT: backlog count is available.',
        'FORECAST: insufficient 30-day intake/resolution activity to project backlog reliably.',
      ],
    };
  }

  const averageDailyIntake = roundToOneDecimal(totalCreated / 30);
  const averageDailyResolution = roundToOneDecimal(totalResolved / 30);
  const netDailyChange = roundToOneDecimal(averageDailyIntake - averageDailyResolution);
  const direction = deriveDirection(netDailyChange);
  const dailySeries = createDailySeries(30, now);

  const points: BacklogForecastPoint[] = dailySeries.map((item, index) => {
    const day = index + 1;
    return {
      date: item.key,
      projectedOpenIssues: forecastCount(currentBacklog, netDailyChange, day),
      projectedNewIssues: Math.max(0, Math.round(averageDailyIntake * day)),
      projectedResolvedIssues: Math.max(0, Math.round(averageDailyResolution * day)),
    };
  });

  return {
    currentBacklog,
    forecast7Days: forecastCount(currentBacklog, netDailyChange, 7),
    forecast14Days: forecastCount(currentBacklog, netDailyChange, 14),
    forecast30Days: forecastCount(currentBacklog, netDailyChange, 30),
    direction,
    confidence,
    points,
    explanation: [
      `CURRENT FACT: open backlog = ${currentBacklog} active issues.`,
      `DETERMINISTIC CALCULATION: 30-day average intake = ${averageDailyIntake}/day; 30-day average resolution = ${averageDailyResolution}/day.`,
      `FORECAST: net backlog change = ${netDailyChange >= 0 ? '+' : ''}${netDailyChange} issues/day applied linearly over 7, 14, and 30 days.`,
    ],
  };
}

export class BacklogForecastService {
  async forecastBacklog(currentUser: JwtPayload, projectId: string): Promise<BacklogForecast> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const issues = await prisma.issue.findMany({
      where: { projectId },
      select: {
        status: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
      },
    });
    return buildBacklogForecast(issues as ForecastIssue[]);
  }
}

export const backlogForecastService = new BacklogForecastService();
