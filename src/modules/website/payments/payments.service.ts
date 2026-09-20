import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';

export class WebsitePaymentsService {
  static async uploadPaymentProof(userId: bigint, data: { orderId: bigint; paymentType: 'dp' | 'pelunasan' | 'refund'; amount: number; paymentMethod?: string; proofImage: string }) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId },
    });

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        paymentType: data.paymentType,
        amount: data.amount,
        paymentMethod: data.paymentMethod || 'manual_transfer',
        proofImage: data.proofImage,
        status: 'menunggu',
      },
    });

    // Notify admins of new proof of payment
    const admins = await prisma.admin.findMany({ select: { id: true } });
    for (const admin of admins) {
      await dispatchNotification({
        recipientType: 'admin',
        recipientId: admin.id,
        type: 'PAYMENT_PROOF_UPLOADED',
        title: 'Bukti Pembayaran Diunggah',
        message: `Bukti transfer (${data.paymentType}) untuk pesanan ${order.orderNumber} diunggah oleh pelanggan.`,
        relatedOrderId: order.id,
      });
    }

    return payment;
  }
}
