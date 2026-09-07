import { NotificationType } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';

export class NotificationService {
  private formatNotification(n: any) {
    return {
      id: n.id,
      userId: n.userId,
      issueId: n.issueId,
      title: n.title,
      message: n.message,
      type: n.type as NotificationType,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    };
  }

  async getUserNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return notifications.map((n) => this.formatNotification(n));
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw ApiError.notFound(`Notification with ID '${id}' not found`);
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden('Cannot modify notification belonging to another user');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return this.formatNotification(updated);
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    issueId?: string;
    link?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        issueId: data.issueId || null,
        link: data.link || null,
      },
    });

    // Extensible hook location for future WebSocket / SSE real-time push:
    // realTimeNotifier.broadcastToUser(data.userId, notification);

    return this.formatNotification(notification);
  }
}

export const notificationService = new NotificationService();
