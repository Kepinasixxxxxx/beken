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

      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const isLunas = totalPaid >= Number(payment.order.totalPrice);

      let nextStatus = payment.order.status;
      if (isLunas) {
        nextStatus = payment.order.requiresProduction ? 'diproses' : 'siap_diambil';
      } else if (payment.paymentType === 'dp' && payment.order.status === 'dikonfirmasi') {
        nextStatus = 'diproses';
      }

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          isLunas,
          status: nextStatus,
        },
      });

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
