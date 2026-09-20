import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';

export class MobileOrdersService {
  static async getAll(query: { status?: string; orderType?: string; search?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.orderType) where.orderType = query.orderType;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { user: { name: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
      ];
    }

    return prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: true, productVariant: true, accessory: true } },
        rental: true,
        customOrderDetail: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: bigint) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: true, productVariant: true, accessory: true } },
        rental: true,
        customOrderDetail: true,
        payments: true,
        statusHistory: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new AppError('Pesanan tidak ditemukan', 404);
    return order;
  }

  static async confirmOrder(orderId: bigint, adminId: bigint, dpAmount?: number) {
    const order = await this.getById(orderId);
    if (order.status !== 'pending') {
      throw new AppError('Hanya pesanan berstatus pending yang dapat dikonfirmasi.', 400);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'dikonfirmasi',
        dpAmount: dpAmount ? dpAmount : order.dpAmount,
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        progressPercentage: 0,
        statusLabel: 'Pesanan Dikonfirmasi Admin',
        note: 'Admin telah mengonfirmasi pesanan.',
        updatedBy: adminId,
      },
    });

    await dispatchNotification({
      recipientType: 'user',
      recipientId: order.userId,
      type: 'ORDER_CONFIRMED',
      title: 'Pesanan Dikonfirmasi',
      message: `Pesanan ${order.orderNumber} telah dikonfirmasi oleh admin. Silakan lakukan pembayaran.`,
      relatedOrderId: order.id,
    });

    return updated;
  }

  static async updateProgress(orderId: bigint, adminId: bigint, data: { progressPercentage: number; statusLabel: string; note?: string }) {
    const order = await this.getById(orderId);

    const history = await prisma.orderStatusHistory.create({
      data: {
        orderId,
        progressPercentage: data.progressPercentage,
        statusLabel: data.statusLabel,
        note: data.note,
        updatedBy: adminId,
      },
    });

    if (data.progressPercentage >= 100 && order.isLunas) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'siap_diambil' },
      });
    } else if (data.progressPercentage > 0 && order.status !== 'diproses') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'diproses' },
      });
    }

    await dispatchNotification({
      recipientType: 'user',
      recipientId: order.userId,
      type: 'ORDER_PROGRESS_UPDATE',
      title: 'Perkembangan Pesanan',
      message: `Status pesanan ${order.orderNumber}: ${data.statusLabel} (${data.progressPercentage}%)`,
      relatedOrderId: order.id,
    });

    return history;
  }

  static async changeStatus(orderId: bigint, adminId: bigint, status: any, note?: string) {
    const order = await this.getById(orderId);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        progressPercentage: status === 'selesai' ? 100 : 0,
        statusLabel: `Status diubah ke ${status}`,
        note,
        updatedBy: adminId,
      },
    });

    await dispatchNotification({
      recipientType: 'user',
      recipientId: order.userId,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Status Pesanan Diperbarui',
      message: `Status pesanan ${order.orderNumber} kini berstatus: ${status}`,
      relatedOrderId: order.id,
    });

    return updated;
  }
}
