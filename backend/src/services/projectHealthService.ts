import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { issueQualityService } from '../ai/triage/issueQualityService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { ProjectHealthScore } from '@app-issue-track/shared';

export class ProjectHealthService {
  async calculateProjectHealth(currentUser: JwtPayload, projectId: string): Promise<ProjectHealthScore> {
    // 1. Authorization Check
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view project health for this project');
    }

    // 2. Fetch project issues from PostgreSQL
    const issues = await prisma.issue.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        severity: true,
        moduleComponent: true,
        environment: true,
        stepsToReproduce: true,
        expectedResult: true,
        actualResult: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
      },
    });

    if (issues.length === 0) {
      return {
        score: 100,
        level: 'HEALTHY',
        breakdown: {
          slaPerformance: 100,
          resolutionVelocity: 100,
          criticalBacklog: 100,
          developerCapacity: 100,
          issueQuality: 100,
          issueAging: 100,
        },
        reasons: ['Project has no issues reported yet. Operating cleanly.'],
      };
    }

    const reasons: string[] = [];

    // Factor 1: SLA Performance (25%)
    let slaBreaches = 0;
    for (const issue of issues) {
      const sla = slaService.calculateSlaForIssue(issue as any);
      if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
        slaBreaches++;
      }
    }
    const slaComplianceRatio = Math.max(0, 1 - slaBreaches / issues.length);
    const slaScore = Math.round(slaComplianceRatio * 100);
    if (slaComplianceRatio < 0.85) {
      reasons.push(`SLA compliance dropped to ${Math.round(slaComplianceRatio * 100)}% (${slaBreaches} breaches)`);
    } else {
      reasons.push(`Strong SLA compliance at ${Math.round(slaComplianceRatio * 100)}%`);
    }

    // Factor 2: Resolution Velocity (20%)
    const resolvedIssues = issues.filter((i) => i.resolvedAt || i.closedAt);
    const velocityRatio = resolvedIssues.length / issues.length;
    const velocityScore = Math.round(velocityRatio * 100);
    if (velocityRatio < 0.5) {
      reasons.push(`Resolution velocity is low (${resolvedIssues.length} resolved of ${issues.length} total)`);
    } else {
      reasons.push(`Healthy resolution velocity (${Math.round(velocityRatio * 100)}% resolved)`);
    }

    // Factor 3: Critical Backlog (20%)
    const activeCritical = issues.filter(
      (i) =>
        i.status !== 'RESOLVED' &&
        i.status !== 'CLOSED' &&
        (i.priority === 'CRITICAL' || i.severity === 'CRITICAL' || i.severity === 'BLOCKER')
    );
    const criticalScore = Math.max(0, 100 - activeCritical.length * 20);
    if (activeCritical.length > 0) {
      reasons.push(`${activeCritical.length} active critical/blocker issue(s) unresolved`);
    } else {
      reasons.push('Zero active critical/blocker issues in backlog');
    }

    // Factor 4: Developer Capacity (15%)
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });
    const developerCount = Math.max(1, members.length);
    const activeIssuesCount = issues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const avgActivePerDev = activeIssuesCount / developerCount;

    let capacityScore = 100;
    if (avgActivePerDev > 4) {
      capacityScore = 50;
      reasons.push(`High workload density: average ${avgActivePerDev.toFixed(1)} active issues per developer`);
    } else if (avgActivePerDev > 2) {
      capacityScore = 75;
      reasons.push(`Moderate developer capacity load (${avgActivePerDev.toFixed(1)} active per developer)`);
    } else {
      reasons.push('Developer capacity is well balanced');
    }

    // Factor 5: Issue Quality (10%) — Reusing Phase 4 issueQualityService!
    let totalQuality = 0;
    for (const issue of issues) {
      const q = issueQualityService.calculateQualityScore(issue as any);
      totalQuality += q.score;
    }
    const qualityScore = Math.round(totalQuality / issues.length);
    if (qualityScore < 70) {
      reasons.push(`Average report quality score is low (${qualityScore}/100)`);
    } else {
      reasons.push(`High average report quality score (${qualityScore}/100)`);
    }

    // Factor 6: Issue Aging (10%)
    const now = new Date().getTime();
    let oldAgingCount = 0;
    for (const issue of issues) {
      if (issue.status !== 'RESOLVED' && issue.status !== 'CLOSED') {
        const ageDays = (now - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays > 7) {
          oldAgingCount++;
        }
      }
    }
    const agingScore = Math.max(0, 100 - oldAgingCount * 15);
    if (oldAgingCount > 0) {
      reasons.push(`${oldAgingCount} active issue(s) aging older than 7 days`);
    } else {
      reasons.push('No aging issues older than 7 days');
    }

    // Weighted Overall Score
    const totalScore = Math.round(
      slaScore * 0.25 +
        velocityScore * 0.2 +
        criticalScore * 0.2 +
        capacityScore * 0.15 +
        qualityScore * 0.1 +
        agingScore * 0.1
    );

    const score = Math.min(100, Math.max(0, totalScore));

    let level: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' = 'HEALTHY';
    if (score < 75) {
      level = 'CRITICAL';
    } else if (score < 90) {
      level = 'AT_RISK';
    }

    return {
      score,
      level,
      breakdown: {
        slaPerformance: slaScore,
        resolutionVelocity: velocityScore,
        criticalBacklog: criticalScore,
        developerCapacity: capacityScore,
        issueQuality: qualityScore,
        issueAging: agingScore,
      },
      reasons,
    };
  }
}

export const projectHealthService = new ProjectHealthService();
