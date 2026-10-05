import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';

export class MobilePaymentsService {
  static async getAll(query: { status?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;

    return prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        verifier: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async verifyPayment(paymentId: bigint, adminId: bigint, status: 'terverifikasi' | 'ditolak', refundReason?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) throw new AppError('Pembayaran tidak ditemukan.', 404);

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        refundReason: status === 'ditolak' ? refundReason : payment.refundReason,
      },
    });

    if (status === 'terverifikasi') {
      // Calculate total verified payments for this order
      const payments = await prisma.payment.findMany({
        where: { orderId: payment.orderId, status: 'terverifikasi' },
      });

      const order = payment.order;
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPrice = Number(order.totalPrice);
      const isLunas = totalPrice > 0 && totalPaid >= totalPrice;
      const latest = await prisma.orderStatusHistory.findFirst({
        where: { orderId: order.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { progressPercentage: true },
      });
      const productionDone = (latest?.progressPercentage ?? 0) >= 100;

      let nextStatus = order.status;
      if (totalPrice > 0 && ['pending', 'dikonfirmasi', 'diproses'].includes(order.status)) {
        if (isLunas) {
          nextStatus = order.requiresProduction && !productionDone ? 'diproses' : 'siap_diambil';
        } else if (payment.paymentType === 'dp') {
          nextStatus = 'diproses';
        }
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          isLunas,
          status: nextStatus,
          ...(order.status === 'pending' ? { expiredAt: null } : {}),
        },
      });

      if (order.status === 'pending' && nextStatus !== 'pending') {
        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            progressPercentage: 0,
            statusLabel: 'Pesanan Dikonfirmasi Admin',
            note: `Dikonfirmasi otomatis saat ${payment.paymentType === 'dp' ? 'DP' : 'pembayaran'} diverifikasi.`,
            updatedBy: adminId,
          },
        });
      }

      await dispatchNotification({
        recipientType: 'user',
        recipientId: payment.order.userId,
        type: 'PAYMENT_VERIFIED',
        title: 'Pembayaran Terverifikasi',
        message: `Pembayaran sebesar Rp ${payment.amount.toLocaleString()} untuk pesanan ${payment.order.orderNumber} telah diverifikasi.`,
        relatedOrderId: payment.orderId,
      });
    } else {
      await dispatchNotification({
        recipientType: 'user',
        recipientId: payment.order.userId,
        type: 'PAYMENT_REJECTED',
        title: 'Pembayaran Ditolak',
        message: `Pembayaran untuk pesanan ${payment.order.orderNumber} ditolak. ${refundReason || ''}`,
        relatedOrderId: payment.orderId,
      });
    }

    return updatedPayment;
  }
}
