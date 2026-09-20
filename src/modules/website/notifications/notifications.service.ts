import { prisma } from '../../../config/prisma';

export class WebsiteNotificationsService {
  static async getNotifications(userId: bigint) {
    return prisma.notification.findMany({
      where: { recipientType: 'user', recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(userId: bigint, notificationId: bigint) {
    return prisma.notification.updateMany({
      where: { id: notificationId, recipientType: 'user', recipientId: userId },
      data: { isRead: true },
    });
  }
}
