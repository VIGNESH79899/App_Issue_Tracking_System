import { UserRole } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { JwtPayload } from '../middlewares/auth.js';

export class ProjectAccessService {
  /**
   * Returns list of accessible project IDs for the user.
   * Returns `null` if user is ADMIN (unrestricted access).
   * Returns `[]` if user has no project memberships.
   */
  async getAccessibleProjectIds(currentUser: JwtPayload): Promise<string[] | null> {
    if (currentUser.role === UserRole.ADMIN) {
      return null; // Global access
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId: currentUser.userId },
      select: { projectId: true },
    });

    return memberships.map((m) => m.projectId);
  }

  /**
   * Checks if user has permission to view/access a specific project.
   */
  async canAccessProject(currentUser: JwtPayload, projectId: string): Promise<boolean> {
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: currentUser.userId },
    });

    return !!member;
  }

  /**
   * Checks if user has project-management rights on a specific project.
   * Admins or members with PROJECT_MANAGER/ADMIN role in project or user role.
   */
  async canManageProject(currentUser: JwtPayload, projectId: string): Promise<boolean> {
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: currentUser.userId },
    });

    if (!member) {
      return false;
    }

    return (
      member.roleInProject === UserRole.PROJECT_MANAGER ||
      member.roleInProject === UserRole.ADMIN ||
      currentUser.role === UserRole.PROJECT_MANAGER
    );
  }

  /**
   * Performs minimal lookup to resolve issue.projectId and validates project access.
   */
  async canAccessIssue(currentUser: JwtPayload, issueId: string): Promise<boolean> {
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { projectId: true },
    });

    if (!issue) {
      return false;
    }

    return this.canAccessProject(currentUser, issue.projectId);
  }

  /**
   * Returns list of accessible application IDs for the user.
   * Returns `null` if user is ADMIN (unrestricted access).
   * Returns `[]` if user has no project memberships.
   */
  async getAccessibleApplicationIds(currentUser: JwtPayload): Promise<string[] | null> {
    if (currentUser.role === UserRole.ADMIN) {
      return null;
    }

    const projectIds = await this.getAccessibleProjectIds(currentUser);
    if (!projectIds || projectIds.length === 0) {
      return [];
    }

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { applicationId: true },
    });

    return Array.from(new Set(projects.map((p) => p.applicationId)));
  }
}

export const projectAccessService = new ProjectAccessService();
