import {
  CreateIssueInput,
  UpdateIssueInput,
  IssueQueryInput,
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  ALLOWED_STATUS_TRANSITIONS,
  HistoryAction,
  NotificationType,
  UserRole,
} from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { historyService } from './historyService.js';
import { notificationService } from './notificationService.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';

export class IssueService {
  private safeIso(val: any): string | null {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString();
    try {
      return new Date(val).toISOString();
    } catch {
      return String(val);
    }
  }

  private formatIssue(issue: any) {
    if (!issue) return null;
    return {
      id: issue.id,
      issueKey: issue.issueKey,
      title: issue.title,
      description: issue.description,
      applicationId: issue.applicationId,
      applicationName: issue.application?.name || undefined,
      projectId: issue.projectId,
      projectName: issue.project?.name || undefined,
      moduleComponent: issue.moduleComponent,
      reporterId: issue.reporterId,
      reporter: issue.reporter
        ? {
            id: issue.reporter.id,
            email: issue.reporter.email,
            firstName: issue.reporter.firstName,
            lastName: issue.reporter.lastName,
            role: issue.reporter.role,
            isActive: issue.reporter.isActive,
            createdAt: this.safeIso(issue.reporter.createdAt),
            updatedAt: this.safeIso(issue.reporter.updatedAt),
          }
        : undefined,
      assigneeId: issue.assigneeId,
      assignee: issue.assignee
        ? {
            id: issue.assignee.id,
            email: issue.assignee.email,
            firstName: issue.assignee.firstName,
            lastName: issue.assignee.lastName,
            role: issue.assignee.role,
            isActive: issue.assignee.isActive,
            createdAt: this.safeIso(issue.assignee.createdAt),
            updatedAt: this.safeIso(issue.assignee.updatedAt),
          }
        : null,
      status: issue.status as IssueStatus,
      priority: issue.priority as IssuePriority,
      severity: issue.severity as IssueSeverity,
      environment: issue.environment,
      stepsToReproduce: issue.stepsToReproduce,
      expectedResult: issue.expectedResult,
      actualResult: issue.actualResult,
      dueDate: this.safeIso(issue.dueDate),
      resolution: issue.resolution,
      resolvedAt: this.safeIso(issue.resolvedAt),
      closedAt: this.safeIso(issue.closedAt),
      commentsCount: issue._count?.comments ?? undefined,
      attachmentsCount: issue._count?.attachments ?? undefined,
      createdAt: this.safeIso(issue.createdAt),
      updatedAt: this.safeIso(issue.updatedAt),
    };
  }

  async getIssues(currentUser: JwtPayload, query: IssueQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const projectIds = await projectAccessService.getAccessibleProjectIds(currentUser);

    // CRITICAL: Explicitly return empty result for unassigned users
    if (projectIds !== null && projectIds.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const where: any = {};

    if (query.projectId) {
      const canAccess = await projectAccessService.canAccessProject(currentUser, query.projectId);
      if (!canAccess) {
        throw ApiError.forbidden('You do not have permission to access issues for this project');
      }
      where.projectId = query.projectId;
    } else if (projectIds !== null) {
      where.projectId = { in: projectIds };
    }

    if (query.applicationId) {
      where.applicationId = query.applicationId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.severity) {
      where.severity = query.severity;
    }
    if (query.assigneeId) {
      where.assigneeId = query.assigneeId;
    }
    if (query.reporterId) {
      where.reporterId = query.reporterId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { issueKey: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [issues, totalItems] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          application: true,
          project: true,
          reporter: true,
          assignee: true,
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: issues.map((issue) => this.formatIssue(issue)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getIssueById(currentUser: JwtPayload, idOrKey: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrKey);
    const whereCondition = isUuid ? { id: idOrKey } : { issueKey: idOrKey };

    const issue = await prisma.issue.findUnique({
      where: whereCondition,
      include: {
        application: true,
        project: {
          include: { members: true },
        },
        reporter: true,
        assignee: true,
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue '${idOrKey}' not found`);
    }

    const canAccess = await projectAccessService.canAccessProject(currentUser, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view issues for this project');
    }

    return this.formatIssue(issue);
  }

  async createIssue(currentUser: JwtPayload, input: CreateIssueInput) {
    // 1. Validate project access
    const canAccess = await projectAccessService.canAccessProject(currentUser, input.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to create issues in this project');
    }

    // 2. Validate application/project consistency
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
    });

    if (!project) {
      throw ApiError.badRequest(`Project with ID '${input.projectId}' does not exist`);
    }

    if (project.applicationId !== input.applicationId) {
      throw ApiError.badRequest('The selected project does not belong to the specified application');
    }

    // Auto-generate Issue Key based on Project Key (e.g. PAY-104)
    const count = await prisma.issue.count({
      where: { projectId: input.projectId },
    });
    const issueKey = `${project.key}-${count + 100}`;

    const issue = await prisma.issue.create({
      data: {
        issueKey,
        title: input.title,
        description: input.description,
        applicationId: input.applicationId,
        projectId: input.projectId,
        moduleComponent: input.moduleComponent || null,
        reporterId: currentUser.userId,
        assigneeId: input.assigneeId || null,
        priority: input.priority || IssuePriority.MEDIUM,
        severity: input.severity || IssueSeverity.MINOR,
        environment: input.environment || null,
        stepsToReproduce: input.stepsToReproduce || null,
        expectedResult: input.expectedResult || null,
        actualResult: input.actualResult || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: input.assigneeId ? IssueStatus.ASSIGNED : IssueStatus.OPEN,
      },
      include: {
        application: true,
        project: true,
        reporter: true,
        assignee: true,
      },
    });

    // History Log
    await historyService.createHistoryRecord({
      issueId: issue.id,
      changedById: currentUser.userId,
      actionType: HistoryAction.ISSUE_CREATED,
      fieldChanged: 'Issue',
      newValue: `Created issue ${issue.issueKey}`,
    });

    // Notification if assigned upon creation
    if (issue.assigneeId) {
      await notificationService.createNotification({
        userId: issue.assigneeId,
        issueId: issue.id,
        title: 'Assigned to New Issue',
        message: `You have been assigned to ${issue.issueKey}: ${issue.title}`,
        type: NotificationType.ISSUE_ASSIGNED,
        link: `/issues/${issue.issueKey}`,
      });
    }

    return this.formatIssue(issue);
  }

  async updateIssue(id: string, userId: string, input: UpdateIssueInput) {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${id}' not found`);
    }

    // Check status transition if status is being updated
    if (input.status && input.status !== issue.status) {
      await this.changeStatusInternal(issue, userId, input.status, input.resolution ?? undefined);
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.moduleComponent !== undefined && { moduleComponent: input.moduleComponent }),
        ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
        ...(input.priority && { priority: input.priority }),
        ...(input.severity && { severity: input.severity }),
        ...(input.environment !== undefined && { environment: input.environment }),
        ...(input.stepsToReproduce !== undefined && { stepsToReproduce: input.stepsToReproduce }),
        ...(input.expectedResult !== undefined && { expectedResult: input.expectedResult }),
        ...(input.actualResult !== undefined && { actualResult: input.actualResult }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
        ...(input.resolution !== undefined && { resolution: input.resolution }),
      },
      include: {
        application: true,
        project: true,
        reporter: true,
        assignee: true,
      },
    });

    return this.formatIssue(updated);
  }

  async changeStatus(id: string, userId: string, targetStatus: IssueStatus, resolution?: string) {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${id}' not found`);
    }

    return await this.changeStatusInternal(issue, userId, targetStatus, resolution);
  }

  private async changeStatusInternal(
    issue: any,
    userId: string,
    targetStatus: IssueStatus,
    resolution?: string
  ) {
    const currentStatus = issue.status as IssueStatus;

    if (currentStatus === targetStatus) {
      return this.formatIssue(issue);
    }

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(targetStatus)) {
      throw ApiError.badRequest(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: [${allowedNextStatuses.join(
          ', '
        )}]`
      );
    }

    // Timestamps update logic
    const updateData: any = {
      status: targetStatus,
    };

    if (resolution !== undefined) {
      updateData.resolution = resolution;
    }

    if (targetStatus === IssueStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    } else if (targetStatus === IssueStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issue.id },
      data: updateData,
      include: {
        application: true,
        project: true,
        reporter: true,
        assignee: true,
      },
    });

    // Determine Action Type for Audit Log
    let actionType = HistoryAction.STATUS_CHANGED;
    if (targetStatus === IssueStatus.RESOLVED) actionType = HistoryAction.ISSUE_RESOLVED;
    if (targetStatus === IssueStatus.CLOSED) actionType = HistoryAction.ISSUE_CLOSED;
    if (targetStatus === IssueStatus.REOPENED) actionType = HistoryAction.ISSUE_REOPENED;

    await historyService.createHistoryRecord({
      issueId: issue.id,
      changedById: userId,
      actionType,
      fieldChanged: 'status',
      oldValue: currentStatus,
      newValue: targetStatus,
    });

    // Notify Reporter & Assignee
    const notifyUserIds = new Set<string>();
    if (issue.assigneeId && issue.assigneeId !== userId) notifyUserIds.add(issue.assigneeId);
    if (issue.reporterId && issue.reporterId !== userId) notifyUserIds.add(issue.reporterId);

    for (const targetUserId of notifyUserIds) {
      await notificationService.createNotification({
        userId: targetUserId,
        issueId: issue.id,
        title: `Issue Status Changed to ${targetStatus}`,
        message: `${issue.issueKey} status changed from ${currentStatus} to ${targetStatus}`,
        type: NotificationType.STATUS_CHANGED,
        link: `/issues/${issue.issueKey}`,
      });
    }

    return this.formatIssue(updatedIssue);
  }

  async assignIssue(id: string, actorId: string, assigneeId: string | null) {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${id}' not found`);
    }

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) {
        throw ApiError.badRequest(`Assignee user with ID '${assigneeId}' does not exist`);
      }
    }

    const oldAssigneeId = issue.assigneeId;

    // Auto-update status to ASSIGNED if currently OPEN
    let newStatus = issue.status;
    if (assigneeId && issue.status === IssueStatus.OPEN) {
      newStatus = IssueStatus.ASSIGNED;
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        assigneeId,
        status: newStatus,
      },
      include: {
        application: true,
        project: true,
        reporter: true,
        assignee: true,
      },
    });

    // History Log
    await historyService.createHistoryRecord({
      issueId: issue.id,
      changedById: actorId,
      actionType: HistoryAction.ASSIGNED,
      fieldChanged: 'assigneeId',
      oldValue: oldAssigneeId || 'Unassigned',
      newValue: assigneeId || 'Unassigned',
    });

    // Notification
    if (assigneeId && assigneeId !== actorId) {
      await notificationService.createNotification({
        userId: assigneeId,
        issueId: issue.id,
        title: 'Assigned to Issue',
        message: `You have been assigned to issue ${issue.issueKey}: ${issue.title}`,
        type: NotificationType.ISSUE_ASSIGNED,
        link: `/issues/${issue.issueKey}`,
      });
    }

    return this.formatIssue(updatedIssue);
  }

  async deleteIssue(id: string) {
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${id}' not found`);
    }

    await prisma.issue.delete({ where: { id } });
    return { success: true };
  }
}

export const issueService = new IssueService();
