import { CreateProjectInput, UserRole } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';

export class ProjectService {
  private formatProject(p: any) {
    return {
      id: p.id,
      applicationId: p.applicationId,
      applicationName: p.application ? p.application.name : undefined,
      name: p.name,
      key: p.key,
      description: p.description,
      status: p.status,
      startDate: p.startDate ? p.startDate.toISOString() : null,
      endDate: p.endDate ? p.endDate.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  private formatProjectMember(pm: any) {
    return {
      id: pm.id,
      projectId: pm.projectId,
      userId: pm.userId,
      roleInProject: pm.roleInProject as UserRole,
      joinedAt: pm.joinedAt.toISOString(),
      user: pm.user
        ? {
            id: pm.user.id,
            email: pm.user.email,
            firstName: pm.user.firstName,
            lastName: pm.user.lastName,
            role: pm.user.role as UserRole,
            isActive: pm.user.isActive,
            createdAt: pm.user.createdAt.toISOString(),
            updatedAt: pm.user.updatedAt.toISOString(),
          }
        : undefined,
    };
  }

  async getProjects(currentUser: JwtPayload, applicationId?: string) {
    const projectIds = await projectAccessService.getAccessibleProjectIds(currentUser);

    // CRITICAL: Explicitly return empty result for unassigned users
    if (projectIds !== null && projectIds.length === 0) {
      return [];
    }

    const where: any = {
      ...(applicationId && { applicationId }),
    };

    if (projectIds !== null) {
      where.id = { in: projectIds };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        application: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => this.formatProject(p));
  }

  async getProjectById(currentUser: JwtPayload, id: string) {
    const canAccess = await projectAccessService.canAccessProject(currentUser, id);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view this project');
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        application: true,
        members: {
          include: { user: true },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound(`Project with ID '${id}' not found`);
    }

    return this.formatProject(project);
  }

  async getProjectMembers(currentUser: JwtPayload, projectId: string) {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view members of this project');
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((pm) => this.formatProjectMember(pm));
  }

  async addProjectMember(
    currentUser: JwtPayload,
    projectId: string,
    userId: string,
    roleInProject: UserRole = UserRole.DEVELOPER
  ) {
    const canManage = await projectAccessService.canManageProject(currentUser, projectId);
    if (!canManage) {
      throw ApiError.forbidden('You do not have permission to manage members of this project');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw ApiError.notFound(`Project with ID '${projectId}' not found`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.badRequest(`User with ID '${userId}' not found or inactive`);
    }

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (existing) {
      throw ApiError.conflict('User is already a member of this project');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        roleInProject: roleInProject as any,
      },
      include: { user: true },
    });

    return this.formatProjectMember(member);
  }

  async removeProjectMember(currentUser: JwtPayload, projectId: string, userId: string) {
    const canManage = await projectAccessService.canManageProject(currentUser, projectId);
    if (!canManage) {
      throw ApiError.forbidden('You do not have permission to manage members of this project');
    }

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!existing) {
      throw ApiError.notFound('User is not a member of this project');
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  async getTeamMembers(currentUser: JwtPayload) {
    const projectIds = await projectAccessService.getAccessibleProjectIds(currentUser);

    // CRITICAL: Explicitly return empty result for unassigned users
    if (projectIds !== null && projectIds.length === 0) {
      return [];
    }

    const where: any = {};
    if (projectIds !== null) {
      where.projectId = { in: projectIds };
    }

    const memberships = await prisma.projectMember.findMany({
      where,
      include: {
        user: true,
        project: true,
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Deduplicate members across accessible projects
    const memberMap = new Map<string, any>();

    for (const m of memberships) {
      if (!m.user || !m.user.isActive) continue;

      if (!memberMap.has(m.userId)) {
        // Fetch active assigned issues count for this user in accessible projects
        const issueWhere: any = {
          assigneeId: m.userId,
          status: { notIn: ['CLOSED', 'RESOLVED'] },
        };
        if (projectIds !== null) {
          issueWhere.projectId = { in: projectIds };
        }

        const activeIssuesCount = await prisma.issue.count({ where: issueWhere });

        memberMap.set(m.userId, {
          userId: m.user.id,
          email: m.user.email,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          role: m.user.role,
          isActive: m.user.isActive,
          joinedAt: m.joinedAt.toISOString(),
          activeIssuesCount,
          projects: [
            {
              id: m.project.id,
              name: m.project.name,
              key: m.project.key,
              roleInProject: m.roleInProject,
            },
          ],
        });
      } else {
        const existing = memberMap.get(m.userId);
        existing.projects.push({
          id: m.project.id,
          name: m.project.name,
          key: m.project.key,
          roleInProject: m.roleInProject,
        });
      }
    }

    return Array.from(memberMap.values());
  }

  async createProject(input: CreateProjectInput) {
    const app = await prisma.application.findUnique({
      where: { id: input.applicationId },
    });

    if (!app) {
      throw ApiError.badRequest(`Application with ID '${input.applicationId}' does not exist`);
    }

    const existingKey = await prisma.project.findUnique({
      where: { key: input.key },
    });

    if (existingKey) {
      throw ApiError.conflict(`Project key '${input.key}' is already in use`);
    }

    const project = await prisma.project.create({
      data: {
        applicationId: input.applicationId,
        name: input.name,
        key: input.key,
        description: input.description,
        status: 'ACTIVE',
      },
      include: {
        application: true,
      },
    });

    return this.formatProject(project);
  }

  async updateProject(id: string, input: Partial<CreateProjectInput>) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`Project with ID '${id}' not found`);
    }

    if (input.key && input.key !== existing.key) {
      const keyCheck = await prisma.project.findUnique({ where: { key: input.key } });
      if (keyCheck) {
        throw ApiError.conflict(`Project key '${input.key}' is already in use`);
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.key && { key: input.key }),
        ...(input.description !== undefined && { description: input.description }),
      },
      include: {
        application: true,
      },
    });

    return this.formatProject(updated);
  }

  async deleteProject(id: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`Project with ID '${id}' not found`);
    }

    await prisma.project.delete({ where: { id } });
  }
}

export const projectService = new ProjectService();
