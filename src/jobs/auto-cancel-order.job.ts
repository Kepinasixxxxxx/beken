import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { dispatchNotification } from '../shared/services/notificationDispatcher';

export const startAutoCancelOrderJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const expiredOrders = await prisma.order.findMany({
        where: {
          status: 'pending',
          expiredAt: { lte: now },
        },
      });

      for (const order of expiredOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'dibatalkan' },
        });

        await dispatchNotification({
          recipientType: 'user',
          recipientId: order.userId,
          type: 'ORDER_AUTO_CANCELLED',
          title: 'Pesanan Dibatalkan Otomatis',
          message: `Pesanan ${order.orderNumber} telah dibatalkan otomatis karena melewati batas waktu pembayaran.`,
          relatedOrderId: order.id,
        });

        console.log(`[JOB] Order ${order.orderNumber} auto-cancelled.`);
      }
    } catch (error) {
      console.error('[JOB ERROR] Auto-cancel order job failed:', error);
    }
  });

  console.log('[JOB INITIALIZED] Auto-cancel order cron job running (every 5 mins).');
};
