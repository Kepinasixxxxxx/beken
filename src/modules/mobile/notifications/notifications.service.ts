import { prisma } from '../../../config/prisma';

export class MobileNotificationsService {
  static async getNotifications(adminId: bigint) {
    return prisma.notification.findMany({
      where: { recipientType: 'admin', recipientId: adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markAsRead(adminId: bigint, notificationId: bigint) {
    return prisma.notification.updateMany({
      where: { id: notificationId, recipientType: 'admin', recipientId: adminId },
      data: { isRead: true },
    });
  }
}
