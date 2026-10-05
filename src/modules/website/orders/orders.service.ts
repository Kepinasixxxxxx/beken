import { prisma } from '../../../config/prisma';
import { generateOrderNumber } from '../../../shared/utils/orderNumber';
import { checkRentalAvailability } from '../../../shared/services/rentalAvailability';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';
import { AppError } from '../../../middlewares/error-handler';

export class WebsiteOrdersService {
  static async createOrder(userId: bigint, data: any) {
    const { orderType, requiresProduction, notes, items, rentalDetail, customDetail } = data;

    // Calculate total price
    let totalPrice = 0;
    const orderItemsData = items.map((item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      totalPrice += subtotal;
      return {
        itemType: item.itemType,
        productId: item.productId,
        productVariantId: item.productVariantId,
        accessoryId: item.accessoryId,
        quantity: item.quantity,
        size: item.size,
        unitPrice: item.unitPrice,
        subtotal,
      };
    });

    // Check rental availability if orderType === 'sewa'
    if (orderType === 'sewa') {
      if (!rentalDetail || !rentalDetail.pickupDate || !rentalDetail.returnDate) {
        throw new AppError('Detail tanggal sewa (pickupDate & returnDate) wajib diisi untuk sewa.', 400);
      }

      const pickupDate = new Date(rentalDetail.pickupDate);
      const returnDate = new Date(rentalDetail.returnDate);

      for (const item of items) {
        if (item.itemType === 'product' && item.productId) {
          const { availableStock } = await checkRentalAvailability(
            item.productId,
            item.productVariantId || null,
            pickupDate,
            returnDate
          );
          if (availableStock < item.quantity) {
            throw new AppError(
              `Stok sewa tidak mencukupi untuk tanggal ${rentalDetail.pickupDate} s/d ${rentalDetail.returnDate}`,
              400
            );
          }
        }
      }
    }

    const orderNumber = generateOrderNumber();
    const expiredAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour auto-cancel if pending

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        orderType,
        requiresProduction: Boolean(requiresProduction),
        status: 'pending',
        totalPrice,
        expiredAt,
        notes,
        items: {
          createMany: {
            data: orderItemsData,
          },
        },
        ...(orderType === 'sewa' && rentalDetail
          ? {
              rental: {
                create: {
                  pickupDate: new Date(rentalDetail.pickupDate),
                  returnDate: new Date(rentalDetail.returnDate),
                  status: 'dipesan',
                },
              },
            }
          : {}),
        ...(orderType === 'custom' && customDetail
          ? {
              customOrderDetail: {
                create: {
                  designReference: customDetail.designReference,
                  designDescription: customDetail.designDescription,
                  jenisJenjang: customDetail.jenisJenjang,
                  consultationNote: customDetail.consultationNote,
                },
              },
            }
          : {}),
      },
      include: {
        items: true,
        rental: true,
        customOrderDetail: true,
      },
    });

    // Notify admins of new incoming order
    const admins = await prisma.admin.findMany({ select: { id: true } });
    for (const admin of admins) {
      await dispatchNotification({
        recipientType: 'admin',
        recipientId: admin.id,
        type: 'ORDER_NEW',
        title: 'Pesanan Baru Diterima',
        message: `Pesanan ${order.orderNumber} (${order.orderType}) telah dibuat oleh pelanggan.`,
        relatedOrderId: order.id,
      });
    }

    return order;
  }

  static async getUserOrders(userId: bigint) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true, productVariant: true, accessory: true },
        },
        rental: true,
        customOrderDetail: true,
        payments: true,
        statusHistory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderDetail(userId: bigint, orderId: bigint) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: { product: true, productVariant: true, accessory: true },
        },
        rental: true,
        customOrderDetail: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new AppError('Pesanan tidak ditemukan', 404);
    return order;
  }

  static async getOrderStatusHistory(userId: bigint, orderId: bigint) {
    await this.getOrderDetail(userId, orderId);
    return prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
