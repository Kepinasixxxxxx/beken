import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { checkRentalAvailability } from '../../../shared/services/rentalAvailability';

export class WebsiteProductsService {
  static async getAll(query: { categoryId?: string; search?: string; minPrice?: string; maxPrice?: string }) {
    const where: any = {
      deletedAt: null,
      isVisible: true,
    };

    if (query.categoryId) {
      where.categoryId = BigInt(query.categoryId);
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.basePriceBuy = {
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    }

    return prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: {
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: bigint) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null, isVisible: true },
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
    });

    if (!product) throw new AppError('Produk tidak ditemukan', 404);
    return product;
  }

  static async getAvailability(productId: bigint, variantId: bigint | null, pickupDateStr: string, returnDateStr: string) {
    const pickupDate = new Date(pickupDateStr);
    const returnDate = new Date(returnDateStr);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      throw new AppError('Tanggal pickup atau return tidak valid', 400);
    }

    if (pickupDate > returnDate) {
      throw new AppError('Tanggal pickup harus sebelum atau sama dengan tanggal return', 400);
    }

    return checkRentalAvailability(productId, variantId, pickupDate, returnDate);
  }
}
