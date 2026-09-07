import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { PredictiveSlaRisk } from '@app-issue-track/shared';

export class PredictiveRiskService {
  async predictSlaRisk(currentUser: JwtPayload, issueId: string): Promise<PredictiveSlaRisk> {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignee: {
          include: {
            assignedIssues: {
              where: {
                status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'] },
              },
            },
          },
        },
      },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessProject(currentUser, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to view SLA risk for this issue');
    }

    if (issue.status === 'RESOLVED' || issue.status === 'CLOSED') {
      return {
        issueId: issue.id,
        issueKey: issue.issueKey,
        title: issue.title,
        riskLevel: 'LOW',
        estimatedRiskScore: 0,
        timeRemainingHours: 0,
        factors: ['Issue is already resolved or closed.'],
        recommendedAction: 'No action required.',
      };
    }

    const sla = slaService.calculateSlaForIssue(issue as any);
    const factors: string[] = [];
    let riskScore = 0;

    // 1. SLA Time Remaining Factor
    const remainingHours = Math.min(sla.responseRemainingHours, sla.resolutionRemainingHours);
    if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
      riskScore += 90;
      factors.push('SLA deadline has already been breached!');
    } else if (remainingHours <= 4) {
      riskScore += 50;
      factors.push(`Only ${remainingHours.toFixed(1)} hours remaining before SLA breach.`);
    } else if (remainingHours <= 12) {
      riskScore += 30;
      factors.push(`Under 12 hours remaining before SLA resolution deadline.`);
    }

    // 2. Priority & Severity Weight
    if (issue.priority === 'CRITICAL') {
      riskScore += 20;
      factors.push('CRITICAL priority elevates resolution urgency.');
    } else if (issue.priority === 'HIGH') {
      riskScore += 10;
      factors.push('HIGH priority issue requires active monitoring.');
    }

    if (issue.severity === 'BLOCKER' || issue.severity === 'CRITICAL') {
      riskScore += 15;
      factors.push(`High operational severity [${issue.severity}] increases breach impact.`);
    }

    // 3. Assignee Workload Constraint
    if (!issue.assigneeId) {
      riskScore += 25;
      factors.push('Issue is unassigned! Lacks dedicated developer ownership.');
    } else if (issue.assignee && issue.assignee.assignedIssues.length >= 4) {
      riskScore += 20;
      factors.push(
        `Assignee ${issue.assignee.firstName} ${issue.assignee.lastName} is overloaded with ${issue.assignee.assignedIssues.length} active issues.`
      );
    }

    // 4. Aging without progress
    const hoursSinceUpdate = (new Date().getTime() - new Date(issue.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate > 24 && issue.status !== 'IN_PROGRESS') {
      riskScore += 15;
      factors.push(`No activity updates in the last ${Math.round(hoursSinceUpdate)} hours.`);
    }

    const finalScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'LIKELY_TO_BREACH' = 'LOW';
    let recommendedAction = 'Maintain standard monitoring and progress updates.';

    if (finalScore >= 80) {
      riskLevel = 'LIKELY_TO_BREACH';
      recommendedAction = 'IMMEDIATE ESCALATION: Reassign to available developer or request emergency triage.';
    } else if (finalScore >= 60) {
      riskLevel = 'HIGH';
      recommendedAction = 'High SLA risk: Prioritize active investigation and clear developer bottlenecks.';
    } else if (finalScore >= 35) {
      riskLevel = 'MEDIUM';
      recommendedAction = 'Moderate risk: Ensure developer is actively working on resolution.';
    }

    return {
      issueId: issue.id,
      issueKey: issue.issueKey,
      title: issue.title,
      riskLevel,
      estimatedRiskScore: finalScore,
      timeRemainingHours: remainingHours < 0 ? 0 : Math.round(remainingHours * 10) / 10,
      factors,
      recommendedAction,
    };
  }
}

export const predictiveRiskService = new PredictiveRiskService();
