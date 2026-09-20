import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class MobileCustomersService {
  static async getAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDetail(customerId: bigint) {
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) throw new AppError('Pelanggan tidak ditemukan.', 404);
    return customer;
  }
}
