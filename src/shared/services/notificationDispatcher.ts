import { prisma } from '../../config/prisma';
import { getSocketServer } from '../../config/socket';

export interface DispatchNotificationParams {
  recipientType: 'user' | 'admin';
  recipientId: bigint;
  type: string;
  title: string;
  message: string;
  relatedOrderId?: bigint;
}

export const dispatchNotification = async (params: DispatchNotificationParams) => {
  const notification = await prisma.notification.create({
    data: {
      recipientType: params.recipientType,
      recipientId: params.recipientId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedOrderId: params.relatedOrderId,
    },
  });

  const io = getSocketServer();
  if (io) {
    const namespace = params.recipientType === 'user' ? '/ws/website' : '/ws/mobile';
    const room = `${params.recipientType}:${params.recipientId.toString()}`;
    io.of(namespace).to(room).emit('notification:new', notification);
  }

  return notification;
};
