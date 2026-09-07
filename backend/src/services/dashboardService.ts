import { IssueStatus, ProjectHealth, UserRole } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { JwtPayload } from '../middlewares/auth.js';

export class DashboardService {
  private async getScopedWhere(currentUser: JwtPayload, selectedProjectId?: string) {
    const projectIds = await projectAccessService.getAccessibleProjectIds(currentUser);

    if (selectedProjectId) {
      const canAccess = await projectAccessService.canAccessProject(currentUser, selectedProjectId);
      if (!canAccess) {
        throw ApiError.forbidden('You do not have permission to access metrics for this project');
      }
      return { isUnassigned: false, where: { projectId: selectedProjectId }, projectIds: [selectedProjectId] };
    }

    if (projectIds !== null && projectIds.length === 0) {
      return { isUnassigned: true, where: null, projectIds: [] };
    }

    if (projectIds !== null) {
      return { isUnassigned: false, where: { projectId: { in: projectIds } }, projectIds };
    }

    return { isUnassigned: false, where: {}, projectIds: null };
  }

  async getSummaryMetrics(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, where, projectIds } = await this.getScopedWhere(currentUser, selectedProjectId);

    if (isUnassigned || where === null) {
      return {
        isUnassigned: true,
        totalIssues: 0,
        openIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        verifiedIssues: 0,
        closedIssues: 0,
        reopenedIssues: 0,
        totalApplications: 0,
        totalProjects: 0,
        totalUsers: 0,
        slaSummary: {
          totalActiveIssues: 0,
          compliancePercentage: 100,
          atRiskCount: 0,
          breachedCount: 0,
          avgResponseHours: null,
          avgResolutionHours: null,
          health: ProjectHealth.HEALTHY,
        },
      };
    }

    const appIds = await projectAccessService.getAccessibleApplicationIds(currentUser);
    const slaSummary = await slaService.calculateProjectSlaSummary(currentUser, selectedProjectId);

    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      verifiedIssues,
      closedIssues,
      reopenedIssues,
      totalApplications,
      totalProjects,
    ] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.count({ where: { ...where, status: IssueStatus.OPEN } }),
      prisma.issue.count({ where: { ...where, status: IssueStatus.IN_PROGRESS } }),
      prisma.issue.count({ where: { ...where, status: IssueStatus.RESOLVED } }),
      prisma.issue.count({ where: { ...where, status: IssueStatus.VERIFIED } }),
      prisma.issue.count({ where: { ...where, status: IssueStatus.CLOSED } }),
      prisma.issue.count({ where: { ...where, status: IssueStatus.REOPENED } }),
      appIds !== null
        ? prisma.application.count({ where: { id: { in: appIds }, isActive: true } })
        : prisma.application.count({ where: { isActive: true } }),
      projectIds !== null
        ? prisma.project.count({ where: { id: { in: projectIds }, status: 'ACTIVE' } })
        : prisma.project.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      isUnassigned: false,
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      verifiedIssues,
      closedIssues,
      reopenedIssues,
      totalApplications,
      totalProjects,
      totalUsers: 0,
      slaSummary,
    };
  }

  async getIssuesByStatus(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, where } = await this.getScopedWhere(currentUser, selectedProjectId);
    if (isUnassigned || where === null) return [];

    const grouped = await prisma.issue.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    return Object.values(IssueStatus).map((st) => {
      const match = grouped.find((g) => g.status === st);
      return {
        name: st,
        count: match ? match._count.status : 0,
      };
    });
  }

  async getIssuesByPriority(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, where } = await this.getScopedWhere(currentUser, selectedProjectId);
    if (isUnassigned || where === null) return [];

    const grouped = await prisma.issue.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true },
    });

    return grouped.map((g) => ({
      name: g.priority,
      count: g._count.priority,
    }));
  }

  async getIssuesBySeverity(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, where } = await this.getScopedWhere(currentUser, selectedProjectId);
    if (isUnassigned || where === null) return [];

    const grouped = await prisma.issue.groupBy({
      by: ['severity'],
      where,
      _count: { severity: true },
    });

    return grouped.map((g) => ({
      name: g.severity,
      count: g._count.severity,
    }));
  }

  async getIssuesByApplication(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, where } = await this.getScopedWhere(currentUser, selectedProjectId);
    if (isUnassigned || where === null) return [];

    const grouped = await prisma.issue.groupBy({
      by: ['applicationId'],
      where,
      _count: { applicationId: true },
    });

    const apps = await prisma.application.findMany({
      where: { id: { in: grouped.map((g) => g.applicationId) } },
      select: { id: true, name: true, code: true },
    });

    return grouped.map((g) => {
      const app = apps.find((a) => a.id === g.applicationId);
      return {
        name: app ? `${app.name} (${app.code})` : g.applicationId,
        count: g._count.applicationId,
      };
    });
  }

  async getResolutionMetrics(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, where } = await this.getScopedWhere(currentUser, selectedProjectId);
    if (isUnassigned || where === null) {
      return { averageResolutionHours: 0, resolvedCount: 0 };
    }

    const resolved = await prisma.issue.findMany({
      where: {
        ...where,
        resolvedAt: { not: null },
      },
      select: { createdAt: true, resolvedAt: true },
    });

    if (resolved.length === 0) {
      return { averageResolutionHours: 0, resolvedCount: 0 };
    }

    const totalHours = resolved.reduce((acc, i) => {
      const hours = (new Date(i.resolvedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60);
      return acc + Math.max(0, hours);
    }, 0);

    return {
      averageResolutionHours: Math.round((totalHours / resolved.length) * 10) / 10,
      resolvedCount: resolved.length,
    };
  }

  async getDeveloperWorkloads(currentUser: JwtPayload, selectedProjectId?: string) {
    const { isUnassigned, projectIds } = await this.getScopedWhere(currentUser, selectedProjectId);
    if (isUnassigned) return [];

    const memberWhere: any = {
      user: {
        role: UserRole.DEVELOPER,
        isActive: true,
      },
    };

    if (selectedProjectId) {
      memberWhere.projectId = selectedProjectId;
    } else if (projectIds !== null) {
      memberWhere.projectId = { in: projectIds };
    }

    const members = await prisma.projectMember.findMany({
      where: memberWhere,
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

    const devMap = new Map<string, any>();
    for (const m of members) {
      if (!devMap.has(m.user.id)) {
        devMap.set(m.user.id, m.user);
      }
    }
    const developers = Array.from(devMap.values());

    const result = await Promise.all(
      developers.map(async (dev) => {
        const issueWhere: any = {
          assigneeId: dev.id,
        };
        if (selectedProjectId) {
          issueWhere.projectId = selectedProjectId;
        } else if (projectIds !== null) {
          issueWhere.projectId = { in: projectIds };
        }

        const [assignedCount, inProgressCount, activeCount] = await Promise.all([
          prisma.issue.count({
            where: { ...issueWhere, status: IssueStatus.ASSIGNED },
          }),
          prisma.issue.count({
            where: { ...issueWhere, status: IssueStatus.IN_PROGRESS },
          }),
          prisma.issue.count({
            where: {
              ...issueWhere,
              status: { notIn: [IssueStatus.CLOSED, IssueStatus.RESOLVED] },
            },
          }),
        ]);

        return {
          id: dev.id,
          name: `${dev.firstName} ${dev.lastName}`,
          email: dev.email,
          assignedCount,
          inProgressCount,
          activeIssuesCount: activeCount,
        };
      })
    );

    return result;
  }
}

export const dashboardService = new DashboardService();
