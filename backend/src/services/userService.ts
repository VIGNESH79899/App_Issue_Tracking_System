import { UserRole } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';

export class UserService {
  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async getUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u: any) => this.formatUser(u));
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' not found`);
    }

    return this.formatUser(user);
  }

  async updateUser(id: string, data: { firstName?: string; lastName?: string; email?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' not found`);
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailExists) {
        throw ApiError.conflict('An account with this email address already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email.toLowerCase() }),
      },
    });

    return this.formatUser(updatedUser);
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' not found`);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return this.formatUser(updatedUser);
  }

  async changeUserRole(id: string, role: UserRole) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' not found`);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return this.formatUser(updatedUser);
  }

  async deleteUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw ApiError.badRequest('You cannot delete your own admin account');
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw ApiError.notFound(`User with ID '${targetUserId}' not found`);
    }

    await prisma.$transaction([
      prisma.issue.updateMany({
        where: { assigneeId: targetUserId },
        data: { assigneeId: null },
      }),
      prisma.projectMember.deleteMany({
        where: { userId: targetUserId },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: targetUserId },
      }),
      prisma.user.delete({
        where: { id: targetUserId },
      }),
    ]);
  }
}

export const userService = new UserService();
