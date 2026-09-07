import { CreateCommentInput, HistoryAction, NotificationType } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { historyService } from './historyService.js';
import { notificationService } from './notificationService.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';

export class CommentService {
  private formatComment(c: any) {
    return {
      id: c.id,
      issueId: c.issueId,
      authorId: c.authorId,
      author: c.author
        ? {
            id: c.author.id,
            email: c.author.email,
            firstName: c.author.firstName,
            lastName: c.author.lastName,
            role: c.author.role,
            isActive: c.author.isActive,
            createdAt: c.author.createdAt.toISOString(),
            updatedAt: c.author.updatedAt.toISOString(),
          }
        : undefined,
      content: c.content,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  async getCommentsByIssue(currentUser: JwtPayload, issueId: string, isInternalAllowed = true) {
    const canAccess = await projectAccessService.canAccessIssue(currentUser, issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view comments for this issue');
    }

    const comments = await prisma.comment.findMany({
      where: {
        issueId,
        ...(isInternalAllowed ? {} : { isInternal: false }),
      },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map((c) => this.formatComment(c));
  }

  async createComment(currentUser: JwtPayload, issueId: string, input: CreateCommentInput) {
    const canAccess = await projectAccessService.canAccessIssue(currentUser, issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to comment on this issue');
    }

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    const comment = await prisma.comment.create({
      data: {
        issueId,
        authorId: currentUser.userId,
        content: input.content,
        isInternal: input.isInternal || false,
      },
      include: { author: true },
    });

    // History Log
    await historyService.createHistoryRecord({
      issueId,
      changedById: currentUser.userId,
      actionType: HistoryAction.COMMENT_ADDED,
      fieldChanged: 'Comment',
      newValue: 'Added a comment',
    });

    // Notifications
    const recipients = new Set<string>();
    if (issue.assigneeId && issue.assigneeId !== currentUser.userId) recipients.add(issue.assigneeId);
    if (issue.reporterId && issue.reporterId !== currentUser.userId) recipients.add(issue.reporterId);

    for (const userId of recipients) {
      await notificationService.createNotification({
        userId,
        issueId,
        title: 'New Comment on Issue',
        message: `New comment added to ${issue.issueKey}`,
        type: NotificationType.COMMENT_ADDED,
        link: `/issues/${issue.issueKey}`,
      });
    }

    return this.formatComment(comment);
  }

  async updateComment(currentUser: JwtPayload, commentId: string, content: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw ApiError.notFound(`Comment with ID '${commentId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessIssue(currentUser, comment.issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to update comments on this issue');
    }

    if (comment.authorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      throw ApiError.forbidden('You can only edit your own comments');
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: { author: true },
    });

    return this.formatComment(updated);
  }

  async deleteComment(currentUser: JwtPayload, commentId: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw ApiError.notFound(`Comment with ID '${commentId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessIssue(currentUser, comment.issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to delete comments on this issue');
    }

    if (comment.authorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await prisma.comment.delete({ where: { id: commentId } });
  }
}

export const commentService = new CommentService();
