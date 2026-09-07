import {
  ComponentForecast,
  ForecastConfidence,
} from '@app-issue-track/shared';
import { prisma } from '../../config/database.js';
import { componentRiskService } from '../componentRiskService.js';
import { projectAccessService } from '../projectAccessService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { clamp, deriveConfidence, mapRiskLevelFromScore, roundToOneDecimal } from './analyticsMath.js';

export class ComponentForecastService {
  async forecastComponents(
    currentUser: JwtPayload,
    projectId: string
  ): Promise<ComponentForecast[]> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const summaries = await componentRiskService.getComponentRiskSummaries(currentUser, projectId);
    if (summaries.length === 0) {
      return [];
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const [issues, incidents] = await Promise.all([
      prisma.issue.findMany({
        where: {
          projectId,
          OR: [
            { createdAt: { gte: twentyEightDaysAgo } },
            { resolvedAt: { gte: twentyEightDaysAgo } },
            { closedAt: { gte: twentyEightDaysAgo } },
          ],
        },
        select: {
          moduleComponent: true,
          createdAt: true,
          resolvedAt: true,
          closedAt: true,
        },
      }),
      prisma.incident.findMany({
        where: {
          projectId,
          detectedAt: { gte: twentyEightDaysAgo },
        },
        select: {
          moduleComponent: true,
          detectedAt: true,
        },
      }),
    ]);

    return summaries.map((c) => {
      const componentName = c.component === 'General' ? '' : c.component;
      const componentIssues = issues.filter((issue) => (issue.moduleComponent || '').trim() === componentName);
      const recentCreated = componentIssues.filter((issue) => issue.createdAt >= fourteenDaysAgo).length;
      const previousCreated = componentIssues.filter(
        (issue) => issue.createdAt >= twentyEightDaysAgo && issue.createdAt < fourteenDaysAgo
      ).length;
      const recentResolved = componentIssues.filter(
        (issue) =>
          (issue.resolvedAt && issue.resolvedAt >= fourteenDaysAgo) ||
          (issue.closedAt && issue.closedAt >= fourteenDaysAgo)
      ).length;
      const netDailyChange = roundToOneDecimal((recentCreated - recentResolved) / 14);
      const projectedActive = Math.max(0, Math.round(c.activeIssues + netDailyChange * 14));
      const growthPercentage =
        previousCreated === 0
          ? recentCreated === 0
            ? 0
            : 100
          : Math.round(((recentCreated - previousCreated) / previousCreated) * 100);
      const recentIncidents = incidents.filter(
        (incident) => (incident.moduleComponent || '').trim() === componentName && incident.detectedAt >= fourteenDaysAgo
      ).length;
      const previousIncidents = incidents.filter(
        (incident) =>
          (incident.moduleComponent || '').trim() === componentName &&
          incident.detectedAt >= twentyEightDaysAgo &&
          incident.detectedAt < fourteenDaysAgo
      ).length;
      let incidentTrend = 'STABLE';
      if (recentIncidents > previousIncidents) incidentTrend = 'INCREASING';
      else if (recentIncidents < previousIncidents) incidentTrend = 'DECREASING';

      const projectedRiskScore = clamp(
        Math.round(c.riskScore + Math.max(0, netDailyChange) * 12 + Math.max(0, growthPercentage) * 0.2 + (recentIncidents - previousIncidents) * 10),
        0,
        100
      );
      const projectedRisk = mapRiskLevelFromScore(projectedRiskScore);
      const confidence = deriveConfidence(c.totalIssues + recentIncidents + previousIncidents, 14);

      return {
        component: c.component,
        currentRisk: c.riskLevel,
        projectedRisk,
        currentActiveIssues: c.activeIssues,
        projectedActiveIssues: projectedActive,
        growthPercentage,
        incidentTrend,
        confidence,
        explanation: [
          `CURRENT FACT: ${c.activeIssues} active issues and current component risk ${c.riskLevel}.`,
          `DETERMINISTIC CALCULATION: recent component net flow = ${recentCreated} created - ${recentResolved} resolved over 14 days = ${netDailyChange >= 0 ? '+' : ''}${netDailyChange}/day.`,
          `FORECAST: projected active issues = ${projectedActive}; projected risk score = ${projectedRiskScore}/100 with incident trend ${incidentTrend.toLowerCase()}.`,
        ],
      };
    });
  }
}

export const componentForecastService = new ComponentForecastService();
