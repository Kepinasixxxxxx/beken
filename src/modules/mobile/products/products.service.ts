import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { RedisService } from '../../../shared/services/redis.service';

export class MobileProductsService {
  static async getAll() {
    const cacheKey = 'products:mobile:all';
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: 'desc' },
    });

    await RedisService.set(cacheKey, products, 1800);
    return products;
  }

  static async getById(id: bigint) {
    const cacheKey = `products:detail:${id.toString()}`;
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
    });
    if (!product) throw new AppError('Produk tidak ditemukan', 404);

    await RedisService.set(cacheKey, product, 1800);
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
    const product = await prisma.product.create({
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

    await RedisService.delPattern('products:*');
    await RedisService.delPattern('categories:*');
    return product;
  }

  static async update(id: bigint, data: any) {
    await this.getById(id);

    const { variants, ...updateData } = data;
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
    });

    await RedisService.delPattern('products:*');
    return updated;
  }

  static async softDelete(id: bigint) {
    await this.getById(id);
    const deleted = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await RedisService.delPattern('products:*');
    await RedisService.delPattern('categories:*');
    return deleted;
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
    await RedisService.delPattern('products:*');
    return this.getById(productId);
  }

  static async toggleVisibility(productId: bigint, isVisible: boolean) {
    await this.getById(productId);
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isVisible },
    });

    await RedisService.delPattern('products:*');
    return updated;
  }
}

