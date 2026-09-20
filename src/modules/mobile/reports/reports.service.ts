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

    const revenueAggregate = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'terverifikasi' },
    });

    const totalRevenue = revenueAggregate._sum.amount || 0;

    const ordersByType = await prisma.order.groupBy({
      by: ['orderType'],
      _count: { id: true },
      where: { ...dateFilter, status: { not: 'dibatalkan' } },
    });

    return {
      totalOrders,
      completedOrders,
      totalCustomers,
      totalRevenue,
      ordersByType,
    };
  }
}
