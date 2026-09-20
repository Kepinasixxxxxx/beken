import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class MobileProductsService {
  static async getAll() {
    return prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: bigint) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
    });
    if (!product) throw new AppError('Produk tidak ditemukan', 404);
    return product;
  }

  static async create(data: {
    categoryId: bigint;
    name: string;
    description?: string;
    basePriceBuy?: number;
    basePriceRent?: number;
    isCustomAvailable?: boolean;
    isVisible?: boolean;
    variants?: Array<{
      size: string;
      stockBuy: number;
      stockRent: number;
      priceBuyOverride?: number;
      priceRentOverride?: number;
    }>;
  }) {
    return prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        basePriceBuy: data.basePriceBuy,
        basePriceRent: data.basePriceRent,
        isCustomAvailable: data.isCustomAvailable ?? false,
        isVisible: data.isVisible ?? true,
        variants: data.variants
          ? {
              createMany: {
                data: data.variants.map((v) => ({
                  size: v.size,
                  stockBuy: v.stockBuy,
                  stockRent: v.stockRent,
                  priceBuyOverride: v.priceBuyOverride,
                  priceRentOverride: v.priceRentOverride,
                })),
              },
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
  }

  static async update(id: bigint, data: any) {
    await this.getById(id);

    const { variants, ...updateData } = data;
    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
    });
  }

  static async softDelete(id: bigint) {
    await this.getById(id);
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async addImages(productId: bigint, imageUrls: string[]) {
    await this.getById(productId);
    const existingPrimary = await prisma.productImage.findFirst({
      where: { productId, isPrimary: true },
    });

    const imageData = imageUrls.map((url, idx) => ({
      productId,
      imageUrl: url,
      isPrimary: !existingPrimary && idx === 0,
    }));

    await prisma.productImage.createMany({ data: imageData });
    return this.getById(productId);
  }

  static async toggleVisibility(productId: bigint, isVisible: boolean) {
    await this.getById(productId);
    return prisma.product.update({
      where: { id: productId },
      data: { isVisible },
    });
  }
}
