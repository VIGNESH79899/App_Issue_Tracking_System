import { CreateApplicationInput, UserRole } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { projectAccessService } from './projectAccessService.js';

export class ApplicationService {
  private formatApplication(app: any) {
    return {
      id: app.id,
      name: app.name,
      code: app.code,
      description: app.description,
      version: app.version,
      ownerId: app.ownerId,
      owner: app.owner
        ? {
            id: app.owner.id,
            email: app.owner.email,
            firstName: app.owner.firstName,
            lastName: app.owner.lastName,
            role: app.owner.role,
            isActive: app.owner.isActive,
            createdAt: app.owner.createdAt.toISOString(),
            updatedAt: app.owner.updatedAt.toISOString(),
          }
        : null,
      isActive: app.isActive,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  }

  async getApplications(currentUser: JwtPayload) {
    const appIds = await projectAccessService.getAccessibleApplicationIds(currentUser);

    // CRITICAL: Explicitly return empty result for unassigned users
    if (appIds !== null && appIds.length === 0) {
      return [];
    }

    const where: any = { isActive: true };
    if (appIds !== null) {
      where.id = { in: appIds };
    }

    const apps = await prisma.application.findMany({
      where,
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });
    return apps.map((app) => this.formatApplication(app));
  }

  async getApplicationById(currentUser: JwtPayload, id: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!app) {
      throw ApiError.notFound(`Application with ID '${id}' not found`);
    }

    if (currentUser.role !== UserRole.ADMIN) {
      const appIds = await projectAccessService.getAccessibleApplicationIds(currentUser);
      if (!appIds || !appIds.includes(id)) {
        throw ApiError.forbidden('You do not have permission to view this application');
      }
    }

    return this.formatApplication(app);
  }

  async createApplication(input: CreateApplicationInput) {
    const existing = await prisma.application.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      throw ApiError.conflict(`Application code '${input.code}' is already in use`);
    }

    const app = await prisma.application.create({
      data: {
        name: input.name,
        code: input.code,
        description: input.description,
        version: input.version || '1.0.0',
        ownerId: input.ownerId,
      },
      include: { owner: true },
    });

    return this.formatApplication(app);
  }

  async updateApplication(id: string, input: Partial<CreateApplicationInput>) {
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound(`Application with ID '${id}' not found`);
    }

    if (input.code && input.code !== existing.code) {
      const codeCheck = await prisma.application.findUnique({
        where: { code: input.code },
      });
      if (codeCheck) {
        throw ApiError.conflict(`Application code '${input.code}' is already in use`);
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.code && { code: input.code }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.version && { version: input.version }),
        ...(input.ownerId !== undefined && { ownerId: input.ownerId }),
      },
      include: { owner: true },
    });

    return this.formatApplication(updated);
  }

  async deleteApplication(id: string) {
    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound(`Application with ID '${id}' not found`);
    }

    await prisma.application.delete({
      where: { id },
    });
  }
}

export const applicationService = new ApplicationService();
