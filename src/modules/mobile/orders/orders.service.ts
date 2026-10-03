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
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        items: { include: { product: { include: { images: { orderBy: { isPrimary: 'desc' }, take: 1 } } }, productVariant: true, accessory: true } },
        rental: true,
        customOrderDetail: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        orderSizeEntries: { select: { size: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: bigint) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        items: { include: { product: { include: { images: { orderBy: { isPrimary: 'desc' }, take: 1 } } }, productVariant: true, accessory: true } },
        rental: true,
        customOrderDetail: true,
        payments: true,
        statusHistory: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
        orderSizeEntries: { orderBy: { id: 'asc' } },
        orderPhotos: { orderBy: { createdAt: 'desc' } },
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

  static async submitQuote(
    orderId: bigint,
    adminId: bigint,
    data: { totalPrice: number; dpAmount?: number; deadlineDate?: string; note?: string },
  ) {
    const order = await this.getById(orderId);
    if (order.status !== 'pending') {
      throw new AppError('Penawaran hanya dapat dikirim untuk pesanan berstatus pending.', 400);
    }
    if (!Number.isFinite(data.totalPrice) || data.totalPrice <= 0) {
      throw new AppError('Total harga penawaran tidak valid.', 400);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        totalPrice: data.totalPrice,
        dpAmount: data.dpAmount ?? null,
        deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : order.deadlineDate,
      },
    });

    if (data.note !== undefined) {
      await prisma.customOrderDetail.upsert({
        where: { orderId },
        update: { consultationNote: data.note },
        create: { orderId, consultationNote: data.note },
      });
    }

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        progressPercentage: 0,
        statusLabel: 'Penawaran Harga Dikirim',
        note: data.note,
        updatedBy: adminId,
      },
    });

    await dispatchNotification({
      recipientType: 'user',
      recipientId: order.userId,
      type: 'ORDER_QUOTED',
      title: 'Penawaran Harga Tersedia',
      message: `Penawaran harga untuk pesanan ${order.orderNumber} telah dikirim oleh admin.`,
      relatedOrderId: order.id,
    });

    return updated;
  }

  static async replaceSizeEntries(
    orderId: bigint,
    entries: Array<{ studentName: string; gender?: string; heightCm?: number; size: string; role?: string }>,
  ) {
    await this.getById(orderId);
    const clean = entries
      .map((e) => ({
        studentName: String(e.studentName ?? '').trim().slice(0, 100),
        gender: e.gender ? String(e.gender).trim().toUpperCase().slice(0, 1) : null,
        heightCm: e.heightCm ? Math.round(Number(e.heightCm)) || null : null,
        size: String(e.size ?? '').trim().toUpperCase().slice(0, 20),
        role: e.role ? String(e.role).trim().slice(0, 60) : null,
      }))
      .filter((e) => e.studentName && e.size);
    if (clean.length === 0) throw new AppError('Tidak ada baris data ukuran yang valid.', 400);

    await prisma.$transaction([
      prisma.orderSizeEntry.deleteMany({ where: { orderId } }),
      prisma.orderSizeEntry.createMany({ data: clean.map((e) => ({ orderId, ...e })) }),
    ]);
    return prisma.orderSizeEntry.findMany({ where: { orderId }, orderBy: { id: 'asc' } });
  }

  static async shipOrder(
    orderId: bigint,
    adminId: bigint,
    data: { courier: string; trackingNumber?: string; shippingCost?: number; etaDate?: string },
  ) {
    const order = await this.getById(orderId);
    if (order.status !== 'siap_diambil') {
      throw new AppError('Hanya pesanan berstatus siap diambil/kirim yang dapat dikirim.', 400);
    }
    if (!data.courier?.trim()) throw new AppError('Kurir wajib dipilih.', 400);
    const pickup = data.courier.trim().toLowerCase() === 'ambil sendiri';
    if (!pickup && !data.trackingNumber?.trim()) throw new AppError('Nomor resi wajib diisi.', 400);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        courier: data.courier.trim(),
        trackingNumber: pickup ? null : data.trackingNumber!.trim(),
        shippingCost: data.shippingCost ?? null,
        etaDate: data.etaDate ? new Date(data.etaDate) : null,
        shippedAt: new Date(),
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        progressPercentage: 100,
        statusLabel: pickup ? 'Siap Diambil Pelanggan' : 'Dikirim',
        note: pickup ? 'Pesanan akan diambil sendiri oleh pelanggan.' : `${data.courier} • Resi ${data.trackingNumber}`,
        updatedBy: adminId,
      },
    });

    await dispatchNotification({
      recipientType: 'user',
      recipientId: order.userId,
      type: 'ORDER_SHIPPED',
      title: pickup ? 'Pesanan Siap Diambil' : 'Pesanan Dikirim',
      message: pickup
        ? `Pesanan ${order.orderNumber} siap diambil di workshop VIEGUARD.`
        : `Pesanan ${order.orderNumber} dikirim via ${data.courier} dengan resi ${data.trackingNumber}.`,
      relatedOrderId: order.id,
    });

    return updated;
  }

  static async addPhotos(orderId: bigint, adminId: bigint, data: { category: string; title?: string; isPublic?: boolean; imageUrls: string[] }) {
    await this.getById(orderId);
    const allowed = ['workshop', 'qc', 'kerusakan', 'serah_terima', 'paket'];
    if (!allowed.includes(data.category)) throw new AppError('Kategori foto tidak dikenal.', 400);
    if (data.imageUrls.length === 0) throw new AppError('Pilih minimal satu foto.', 400);
    await prisma.orderPhoto.createMany({
      data: data.imageUrls.map((imageUrl) => ({
        orderId,
        category: data.category,
        title: data.title?.slice(0, 150) || null,
        imageUrl,
        isPublic: data.isPublic ?? true,
        uploadedBy: adminId,
      })),
    });
    return prisma.orderPhoto.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }

  static async deletePhoto(photoId: bigint) {
    const photo = await prisma.orderPhoto.findUnique({ where: { id: photoId } });
    if (!photo) throw new AppError('Foto tidak ditemukan.', 404);
    await prisma.orderPhoto.delete({ where: { id: photoId } });
    return photo;
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
