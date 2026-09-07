import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { DeveloperCapacitySummary } from '@app-issue-track/shared';

export class DeveloperCapacityService {
  async getDeveloperCapacity(
    currentUser: JwtPayload,
    projectId: string
  ): Promise<DeveloperCapacitySummary[]> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view developer capacity for this project');
    }

    // 1. Fetch all project members (developers / project managers)
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (members.length === 0) {
      return [];
    }

    const memberUserIds = members.map((m) => m.userId);

    // 2. Fetch project issues assigned to these members
    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        assigneeId: { in: memberUserIds },
      },
      select: {
        id: true,
        assigneeId: true,
        status: true,
        priority: true,
        severity: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        dueDate: true,
      },
    });

    const now = new Date().getTime();

    // 3. Aggregate per developer
    const summaries: DeveloperCapacitySummary[] = members.map((member) => {
      const devIssues = issues.filter((i) => i.assigneeId === member.userId);
      const activeIssues = devIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      const inProgressIssues = devIssues.filter((i) => i.status === 'IN_PROGRESS').length;
      const criticalHighIssues = devIssues.filter(
        (i) =>
          i.status !== 'RESOLVED' &&
          i.status !== 'CLOSED' &&
          (i.priority === 'CRITICAL' || i.priority === 'HIGH' || i.severity === 'CRITICAL' || i.severity === 'BLOCKER')
      ).length;

      const overdueIssues = devIssues.filter((i) => {
        if (i.status === 'RESOLVED' || i.status === 'CLOSED') return false;
        if (i.dueDate && new Date(i.dueDate).getTime() < now) return true;
        return false;
      }).length;

      const resolved = devIssues.filter((i) => i.resolvedAt || i.closedAt);
      let totalResolutionHours = 0;
      for (const r of resolved) {
        const end = new Date(r.resolvedAt || r.closedAt!).getTime();
        const start = new Date(r.createdAt).getTime();
        totalResolutionHours += (end - start) / (1000 * 60 * 60);
      }
      const averageResolutionHours =
        resolved.length > 0 ? Math.round((totalResolutionHours / resolved.length) * 10) / 10 : null;

      let slaBreaches = 0;
      for (const i of devIssues) {
        const sla = slaService.calculateSlaForIssue(i as any);
        if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
          slaBreaches++;
        }
      }

      // Determine Capacity Level & Score
      let capacityLevel: 'AVAILABLE' | 'NORMAL' | 'BUSY' | 'OVERLOADED' = 'AVAILABLE';
      let capacityScore = 20; // 0-100 load index
      const reasons: string[] = [];

      if (activeIssues >= 6) {
        capacityLevel = 'OVERLOADED';
        capacityScore = 95;
        reasons.push(`Overloaded with ${activeIssues} active issues (threshold >= 6)`);
      } else if (activeIssues >= 4) {
        capacityLevel = 'BUSY';
        capacityScore = 75;
        reasons.push(`High workload density: ${activeIssues} active issues`);
      } else if (activeIssues >= 2) {
        capacityLevel = 'NORMAL';
        capacityScore = 45;
        reasons.push(`Balanced workload with ${activeIssues} active issues`);
      } else {
        capacityLevel = 'AVAILABLE';
        capacityScore = 15;
        reasons.push(`High capacity availability (${activeIssues} active issues)`);
      }

      if (criticalHighIssues > 0) {
        reasons.push(`Assigned ${criticalHighIssues} critical/high priority issue(s)`);
      }
      if (slaBreaches > 0) {
        reasons.push(`Associated with ${slaBreaches} SLA breach(es)`);
      }

      return {
        developerId: member.userId,
        developerName: `${member.user.firstName} ${member.user.lastName}`,
        activeIssues,
        inProgressIssues,
        criticalHighIssues,
        overdueIssues,
        averageResolutionHours,
        resolvedIssues: resolved.length,
        slaBreaches,
        capacityScore,
        capacityLevel,
        reasons,
      };
    });

    return summaries.sort((a, b) => b.capacityScore - a.capacityScore);
  }
}

export const developerCapacityService = new DeveloperCapacityService();
