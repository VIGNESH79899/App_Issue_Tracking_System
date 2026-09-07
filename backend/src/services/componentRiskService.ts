import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { issueQualityService } from '../ai/triage/issueQualityService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { ComponentRiskSummary } from '@app-issue-track/shared';

export class ComponentRiskService {
  async getComponentRiskSummaries(
    currentUser: JwtPayload,
    projectId: string
  ): Promise<ComponentRiskSummary[]> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view component risk for this project');
    }

    const issues = await prisma.issue.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        description: true,
        moduleComponent: true,
        status: true,
        priority: true,
        severity: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        environment: true,
        stepsToReproduce: true,
        expectedResult: true,
        actualResult: true,
      },
    });

    if (issues.length === 0) {
      return [];
    }

    // Group issues by moduleComponent
    const groupedMap = new Map<string, typeof issues>();
    for (const issue of issues) {
      const compName = (issue.moduleComponent || 'General').trim() || 'General';
      if (!groupedMap.has(compName)) {
        groupedMap.set(compName, []);
      }
      groupedMap.get(compName)!.push(issue);
    }

    const now = new Date().getTime();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const results: ComponentRiskSummary[] = [];

    for (const [component, compIssues] of groupedMap.entries()) {
      const totalIssues = compIssues.length;
      const activeIssues = compIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      const criticalIssues = compIssues.filter(
        (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && (i.priority === 'CRITICAL' || i.severity === 'CRITICAL' || i.severity === 'BLOCKER')
      ).length;
      const highIssues = compIssues.filter(
        (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && (i.priority === 'HIGH' || i.severity === 'MAJOR')
      ).length;

      let slaBreaches = 0;
      for (const i of compIssues) {
        const sla = slaService.calculateSlaForIssue(i as any);
        if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
          slaBreaches++;
        }
      }

      const resolved = compIssues.filter((i) => i.resolvedAt || i.closedAt);
      let totalResolutionHours = 0;
      for (const r of resolved) {
        const end = new Date(r.resolvedAt || r.closedAt!).getTime();
        const start = new Date(r.createdAt).getTime();
        totalResolutionHours += (end - start) / (1000 * 60 * 60);
      }
      const averageResolutionHours =
        resolved.length > 0 ? Math.round((totalResolutionHours / resolved.length) * 10) / 10 : null;

      // Quality score evaluation using issueQualityService
      let qualitySum = 0;
      for (const i of compIssues) {
        const q = issueQualityService.calculateQualityScore(i as any);
        qualitySum += q.score;
      }
      const averageQualityScore = Math.round(qualitySum / totalIssues);

      // Recent 7-day growth
      const recentCount = compIssues.filter((i) => new Date(i.createdAt).getTime() >= sevenDaysAgo).length;
      const recentGrowthPercentage = Math.round((recentCount / Math.max(1, totalIssues)) * 100);

      // Recurring issues heuristic (title similarity count > 1)
      const recurringIssues = Math.max(0, totalIssues - new Set(compIssues.map((i) => i.title.toLowerCase())).size);

      // Deterministic Risk Score calculation (0-100)
      let riskScore = 0;
      const reasons: string[] = [];

      if (criticalIssues > 0) {
        riskScore += criticalIssues * 25;
        reasons.push(`${criticalIssues} unresolved critical/blocker issue(s)`);
      }
      if (slaBreaches > 0) {
        riskScore += slaBreaches * 20;
        reasons.push(`${slaBreaches} SLA breach(es) recorded`);
      }
      if (activeIssues >= 3) {
        riskScore += 15;
        reasons.push(`High active backlog of ${activeIssues} open issues`);
      }
      if (recentGrowthPercentage >= 40) {
        riskScore += 15;
        reasons.push(`Rapid issue growth (+${recentGrowthPercentage}% in last 7 days)`);
      }
      if (averageQualityScore < 70) {
        riskScore += 10;
        reasons.push(`Low average issue report quality (${averageQualityScore}/100)`);
      }

      const finalRiskScore = Math.min(100, Math.max(5, riskScore));

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (finalRiskScore >= 75) {
        riskLevel = 'CRITICAL';
      } else if (finalRiskScore >= 50) {
        riskLevel = 'HIGH';
      } else if (finalRiskScore >= 30) {
        riskLevel = 'MEDIUM';
      }

      if (reasons.length === 0) {
        reasons.push('Component is operating within safe risk thresholds.');
      }

      results.push({
        component,
        totalIssues,
        activeIssues,
        criticalIssues,
        highIssues,
        slaBreaches,
        recurringIssues,
        averageResolutionHours,
        averageQualityScore,
        recentGrowthPercentage,
        riskScore: finalRiskScore,
        riskLevel,
        reasons,
      });
    }

    return results.sort((a, b) => b.riskScore - a.riskScore);
  }
}

export const componentRiskService = new ComponentRiskService();
