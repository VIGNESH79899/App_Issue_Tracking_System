import { DeveloperCapacityForecast } from '@app-issue-track/shared';
import { prisma } from '../../config/database.js';
import { developerCapacityService } from '../developerCapacityService.js';
import { projectAccessService } from '../projectAccessService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { roundToOneDecimal } from './analyticsMath.js';

export class CapacityForecastService {
  async forecastDeveloperCapacity(
    currentUser: JwtPayload,
    projectId: string
  ): Promise<DeveloperCapacityForecast[]> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const currentCapacities = await developerCapacityService.getDeveloperCapacity(currentUser, projectId);
    if (currentCapacities.length === 0) {
      return [];
    }

    const memberIds = currentCapacities.map((developer) => developer.developerId);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        assigneeId: { in: memberIds },
        OR: [
          { createdAt: { gte: fourteenDaysAgo } },
          { resolvedAt: { gte: fourteenDaysAgo } },
          { closedAt: { gte: fourteenDaysAgo } },
        ],
      },
      select: {
        assigneeId: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
      },
    });

    return currentCapacities.map((dev) => {
      const recentAssigned = issues.filter(
        (issue) => issue.assigneeId === dev.developerId && issue.createdAt >= fourteenDaysAgo
      ).length;
      const recentResolved = issues.filter(
        (issue) =>
          issue.assigneeId === dev.developerId &&
          ((issue.resolvedAt && issue.resolvedAt >= fourteenDaysAgo) ||
            (issue.closedAt && issue.closedAt >= fourteenDaysAgo))
      ).length;

      const active = dev.activeIssues;
      const netDailyLoad = roundToOneDecimal((recentAssigned - recentResolved) / 14);
      const projected7 = Math.max(0, Math.round(active + netDailyLoad * 7));
      const projected14 = Math.max(0, Math.round(active + netDailyLoad * 14));

      const overloadThreshold = 6;
      let estimatedDaysToOverload: number | null = null;

      if (active >= overloadThreshold) {
        estimatedDaysToOverload = 0;
      } else if (netDailyLoad > 0) {
        estimatedDaysToOverload = Math.max(1, Math.ceil((overloadThreshold - active) / netDailyLoad));
      }

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (dev.capacityLevel === 'OVERLOADED' || projected14 >= overloadThreshold) riskLevel = 'CRITICAL';
      else if (dev.capacityLevel === 'BUSY' || projected14 >= 4) riskLevel = 'HIGH';
      else if (netDailyLoad > 0 || active >= 3) riskLevel = 'MEDIUM';

      let projectedCapacity = dev.capacityLevel;
      if (projected14 >= 6) projectedCapacity = 'OVERLOADED';
      else if (projected14 >= 4) projectedCapacity = 'BUSY';
      else if (projected14 >= 2) projectedCapacity = 'NORMAL';
      else projectedCapacity = 'AVAILABLE';

      return {
        developerId: dev.developerId,
        developerName: dev.developerName,
        currentCapacity: dev.capacityLevel,
        projectedCapacity,
        activeIssues: active,
        projectedIssues7Days: projected7,
        projectedIssues14Days: projected14,
        riskLevel,
        estimatedDaysToOverload,
        explanation: [
          `CURRENT FACT: ${active} active issues assigned now.`,
          `DETERMINISTIC CALCULATION: 14-day assigned minus resolved trend = ${recentAssigned} - ${recentResolved} = ${netDailyLoad >= 0 ? '+' : ''}${netDailyLoad}/day.`,
          `FORECAST: projected assigned workload is ${projected7} in 7 days and ${projected14} in 14 days.`,
        ],
      };
    });
  }
}

export const capacityForecastService = new CapacityForecastService();
