import fs from 'fs';
import path from 'path';
import { HistoryAction } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { historyService } from './historyService.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';
import { env } from '../config/env.js';

export class AttachmentService {
  private formatAttachment(a: any) {
    return {
      id: a.id,
      issueId: a.issueId,
      uploadedById: a.uploadedById,
      uploadedBy: a.uploadedBy
        ? {
            id: a.uploadedBy.id,
            email: a.uploadedBy.email,
            firstName: a.uploadedBy.firstName,
            lastName: a.uploadedBy.lastName,
            role: a.uploadedBy.role,
            isActive: a.uploadedBy.isActive,
            createdAt: a.uploadedBy.createdAt.toISOString(),
            updatedAt: a.uploadedBy.updatedAt.toISOString(),
          }
        : undefined,
      filename: a.filename,
      originalName: a.originalName,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
      createdAt: a.createdAt.toISOString(),
    };
  }

  async getAttachmentsByIssue(currentUser: JwtPayload, issueId: string) {
    const canAccess = await projectAccessService.canAccessIssue(currentUser, issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to view attachments for this issue');
    }

    const attachments = await prisma.attachment.findMany({
      where: { issueId },
      include: { uploadedBy: true },
      orderBy: { createdAt: 'desc' },
    });
    return attachments.map((a) => this.formatAttachment(a));
  }

  async uploadAttachment(currentUser: JwtPayload, issueId: string, file: Express.Multer.File) {
    const canAccess = await projectAccessService.canAccessIssue(currentUser, issueId);
    if (!canAccess) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw ApiError.forbidden('You do not have permission to upload attachments to this issue');
    }

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');

    const attachment = await prisma.attachment.create({
      data: {
        issueId,
        uploadedById: currentUser.userId,
        filename: path.basename(file.path),
        originalName: path.basename(file.originalname),
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: relativePath,
      },
      include: { uploadedBy: true },
    });

    await historyService.createHistoryRecord({
      issueId,
      changedById: currentUser.userId,
      actionType: HistoryAction.ATTACHMENT_ADDED,
      fieldChanged: 'Attachment',
      newValue: attachment.originalName,
    });

    return this.formatAttachment(attachment);
  }

  async deleteAttachment(currentUser: JwtPayload, attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw ApiError.notFound(`Attachment with ID '${attachmentId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessIssue(currentUser, attachment.issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to delete attachments on this issue');
    }

    if (attachment.uploadedById !== currentUser.userId && currentUser.role !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own uploaded attachments');
    }

    const fullPath = path.isAbsolute(attachment.filePath)
      ? attachment.filePath
      : path.join(process.cwd(), attachment.filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });
  }

  async getDownloadableAttachment(currentUser: JwtPayload, attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw ApiError.notFound(`Attachment with ID '${attachmentId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessIssue(currentUser, attachment.issueId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to download this attachment');
    }

    const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
    const resolvedPath = path.resolve(process.cwd(), attachment.filePath);
    if (!resolvedPath.startsWith(`${uploadRoot}${path.sep}`) || !fs.existsSync(resolvedPath)) {
      throw ApiError.notFound('Attachment file is unavailable');
    }

    return {
      path: resolvedPath,
      mimeType: attachment.mimeType,
      originalName: attachment.originalName,
    };
  }
}

export const attachmentService = new AttachmentService();
