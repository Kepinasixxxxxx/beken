import { prisma } from '../../../config/prisma';

export class MobileReportsService {
  static async getSummaryReport(startDateStr?: string, endDateStr?: string) {
    const dateFilter: any = {};
    if (startDateStr && endDateStr) {
      dateFilter.createdAt = {
        gte: new Date(startDateStr),
        lte: new Date(endDateStr),
      };
    }

    const totalOrders = await prisma.order.count({
      where: { ...dateFilter, status: { not: 'dibatalkan' } },
    });

    const completedOrders = await prisma.order.count({
      where: { ...dateFilter, status: 'selesai' },
    });

    const totalCustomers = await prisma.user.count();

    const pendingOrders = await prisma.order.count({
      where: { ...dateFilter, status: 'pending' },
    });

    const verifiedPayments = await prisma.payment.findMany({
      where: { ...dateFilter, status: 'terverifikasi', paymentType: { not: 'refund' } },
      select: { amount: true, order: { select: { orderType: true } } },
    });

    const revenueByType: Record<string, number> = {};
    let totalRevenue = 0;
    for (const p of verifiedPayments) {
      const amount = Number(p.amount);
      totalRevenue += amount;
      revenueByType[p.order.orderType] = (revenueByType[p.order.orderType] ?? 0) + amount;
    }

    const ordersByType = await prisma.order.groupBy({
      by: ['orderType'],
      _count: { id: true },
      where: { ...dateFilter, status: { not: 'dibatalkan' } },
    });

    return {
      totalOrders,
      completedOrders,
      totalCustomers,
      pendingOrders,
      totalRevenue,
      revenueByType,
      ordersByType,
    };
  }
}
