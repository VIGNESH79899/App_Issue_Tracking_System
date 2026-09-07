import { HistoryAction } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';

export class HistoryService {
  private formatHistory(h: any) {
    return {
      id: h.id,
      issueId: h.issueId,
      changedById: h.changedById,
      changedBy: h.changedBy
        ? {
            id: h.changedBy.id,
            email: h.changedBy.email,
            firstName: h.changedBy.firstName,
            lastName: h.changedBy.lastName,
            role: h.changedBy.role,
            isActive: h.changedBy.isActive,
            createdAt: h.changedBy.createdAt.toISOString(),
            updatedAt: h.changedBy.updatedAt.toISOString(),
          }
        : undefined,
      actionType: h.actionType as HistoryAction,
      fieldChanged: h.fieldChanged,
      oldValue: h.oldValue,
      newValue: h.newValue,
      createdAt: h.createdAt.toISOString(),
    };
  }

  async getIssueHistory(currentUser: JwtPayload, issueId: string) {
    const canAccess = await projectAccessService.canAccessIssue(currentUser, issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view history for this issue');
    }

    const history = await prisma.issueHistory.findMany({
      where: { issueId },
      include: { changedBy: true },
      orderBy: { createdAt: 'asc' },
    });
    return history.map((h) => this.formatHistory(h));
  }

  async createHistoryRecord(data: {
    issueId: string;
    changedById: string;
    actionType: HistoryAction;
    fieldChanged: string;
    oldValue?: string | null;
    newValue?: string | null;
  }) {
    const record = await prisma.issueHistory.create({
      data: {
        issueId: data.issueId,
        changedById: data.changedById,
        actionType: data.actionType,
        fieldChanged: data.fieldChanged,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
      },
      include: { changedBy: true },
    });
    return this.formatHistory(record);
  }
}

export const historyService = new HistoryService();
