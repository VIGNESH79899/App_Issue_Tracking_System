import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { TrendPoint } from '@app-issue-track/shared';

export class TrendService {
  async getEngineeringTrends(
    currentUser: JwtPayload,
    projectId: string,
    period: '7d' | '14d' | '30d' = '7d'
  ): Promise<{ period: string; points: TrendPoint[] }> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view trends for this project');
    }

    const days = period === '30d' ? 30 : period === '14d' ? 14 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        OR: [
          { createdAt: { gte: startDate } },
          { resolvedAt: { gte: startDate } },
          { closedAt: { gte: startDate } },
        ],
      },
      select: {
        id: true,
        priority: true,
        severity: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        dueDate: true,
      },
    });

    // Map by date string YYYY-MM-DD
    const pointsMap = new Map<string, TrendPoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      pointsMap.set(dateStr, {
        date: dateStr,
        created: 0,
        resolved: 0,
        breaches: 0,
        critical: 0,
      });
    }

    for (const issue of issues) {
      const createdStr = new Date(issue.createdAt).toISOString().split('T')[0];
      if (pointsMap.has(createdStr)) {
        const pt = pointsMap.get(createdStr)!;
        pt.created++;
        if (issue.priority === 'CRITICAL' || issue.severity === 'CRITICAL' || issue.severity === 'BLOCKER') {
          pt.critical++;
        }
      }

      const resDate = issue.resolvedAt || issue.closedAt;
      if (resDate) {
        const resStr = new Date(resDate).toISOString().split('T')[0];
        if (pointsMap.has(resStr)) {
          const pt = pointsMap.get(resStr)!;
          pt.resolved++;
        }
      }

      const sla = slaService.calculateSlaForIssue(issue as any);
      if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
        if (pointsMap.has(createdStr)) {
          pointsMap.get(createdStr)!.breaches++;
        }
      }
    }

    const points = Array.from(pointsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    return { period, points };
  }
}

export const trendService = new TrendService();
