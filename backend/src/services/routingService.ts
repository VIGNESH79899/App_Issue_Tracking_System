import { SmartAssigneeRecommendation, UserRole, IssueStatus, IssuePriority } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';

export class RoutingService {
  async getSmartAssigneeRecommendations(
    currentUser: JwtPayload,
    issueId: string
  ): Promise<SmartAssigneeRecommendation[]> {
    // 1. Fetch issue
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        projectId: true,
        applicationId: true,
        moduleComponent: true,
        priority: true,
        severity: true,
        title: true,
      },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    // 2. Project-scoped security check via projectAccessService
    const canAccess = await projectAccessService.canAccessProject(currentUser, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to routing recommendations for this issue');
    }

    // 3. Find candidate project members (only active users with DEVELOPER role in project or system)
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId: issue.projectId,
        user: {
          isActive: true,
          role: { in: [UserRole.DEVELOPER, UserRole.PROJECT_MANAGER, UserRole.ADMIN] },
        },
      },
      include: {
        user: true,
      },
    });

    // Filter to only candidates who are DEVELOPER system role OR DEVELOPER project role
    const developerCandidates = projectMembers.filter(
      (pm) => pm.user.role === UserRole.DEVELOPER || pm.roleInProject === UserRole.DEVELOPER
    );

    if (developerCandidates.length === 0) {
      return [];
    }

    const recommendations: SmartAssigneeRecommendation[] = [];

    // 4. Calculate deterministic recommendation scores
    for (const member of developerCandidates) {
      const dev = member.user;
      const reasons: string[] = [];
      let score = 0;

      // Fetch developer's assigned issues in this project
      const assignedIssues = await prisma.issue.findMany({
        where: {
          assigneeId: dev.id,
          projectId: issue.projectId,
        },
        select: {
          id: true,
          status: true,
          priority: true,
          severity: true,
          moduleComponent: true,
          createdAt: true,
          resolvedAt: true,
        },
      });

      const activeIssues = assignedIssues.filter(
        (i) => i.status !== IssueStatus.CLOSED && i.status !== IssueStatus.RESOLVED
      );
      const activeIssueCount = activeIssues.length;
      const criticalHighIssueCount = activeIssues.filter(
        (i) => i.priority === IssuePriority.CRITICAL || i.priority === IssuePriority.HIGH
      ).length;

      const resolvedIssues = assignedIssues.filter((i) => i.resolvedAt !== null);

      // Factor 1: Component / Module Match (35%)
      if (issue.moduleComponent) {
        const matchingCompCount = assignedIssues.filter(
          (i) => i.moduleComponent && i.moduleComponent.toLowerCase() === issue.moduleComponent!.toLowerCase()
        ).length;
        if (matchingCompCount > 0) {
          score += 35;
          reasons.push(`Strong match based on ${matchingCompCount} previous issue(s) in component '${issue.moduleComponent}'`);
        } else {
          score += 10;
        }
      } else {
        score += 20; // Default normalized score when no component specified
      }

      // Factor 2: Project Experience (25%)
      const totalProjectIssues = assignedIssues.length;
      if (totalProjectIssues >= 5) {
        score += 25;
        reasons.push(`Experienced project developer with ${totalProjectIssues} assigned issues`);
      } else if (totalProjectIssues >= 1) {
        score += 15;
        reasons.push(`Has resolved ${resolvedIssues.length} issue(s) in this project`);
      } else {
        score += 5;
      }

      // Factor 3: Current Workload (20%)
      if (activeIssueCount === 0) {
        score += 20;
        reasons.push('Currently has 0 active issues in workload');
      } else if (activeIssueCount === 1) {
        score += 15;
        reasons.push(`Low active workload (${activeIssueCount} active issue)`);
      } else if (activeIssueCount <= 3) {
        score += 10;
      } else {
        score += 5;
      }

      // Factor 4: Similar Issue Experience (10%)
      const similarPriorityCount = resolvedIssues.filter((i) => i.priority === issue.priority).length;
      if (similarPriorityCount > 0) {
        score += 10;
        reasons.push(`Has successfully resolved ${similarPriorityCount} ${issue.priority} priority issue(s)`);
      } else {
        score += 5;
      }

      // Factor 5: Severity Capacity (10%)
      if (criticalHighIssueCount === 0) {
        score += 10;
        reasons.push('Available capacity for critical/high priority work');
      } else {
        score += 3;
      }

      // Calculate average resolution time
      let averageResolutionHours: number | null = null;
      if (resolvedIssues.length > 0) {
        const totalHours = resolvedIssues.reduce((acc, i) => {
          const hrs = (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60);
          return acc + Math.max(0, hrs);
        }, 0);
        averageResolutionHours = Math.round((totalHours / resolvedIssues.length) * 10) / 10;
      }

      const finalScore = Math.min(100, Math.max(10, score));

      recommendations.push({
        userId: dev.id,
        userName: `${dev.firstName} ${dev.lastName}`,
        userEmail: dev.email,
        systemRole: dev.role as UserRole,
        projectRole: member.roleInProject as UserRole,
        score: finalScore,
        activeIssueCount,
        criticalHighIssueCount,
        averageResolutionHours,
        reasons,
      });
    }

    // 5. Deterministic Ranking & Tie-breaking:
    // Primary: Score descending
    // Secondary: activeIssueCount ascending
    // Tertiary: userId ascending
    recommendations.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.activeIssueCount !== b.activeIssueCount) return a.activeIssueCount - b.activeIssueCount;
      return a.userId.localeCompare(b.userId);
    });

    return recommendations.slice(0, 5);
  }
}

export const routingService = new RoutingService();
