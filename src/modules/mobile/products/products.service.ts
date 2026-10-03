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
        productAccessories: { include: { accessory: true } },
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
        productAccessories: { include: { accessory: true } },
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
    sku?: string;
    conditionGrade?: string;
    accessories?: Array<{ name: string; quantityPerSet: number }>;
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
        sku: data.sku,
        conditionGrade: data.conditionGrade,
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

    if (data.accessories?.length) await this.syncAccessories(product.id, data.accessories);

    await RedisService.delPattern('products:*');
    await RedisService.delPattern('categories:*');
    return this.getById(product.id);
  }

  static async syncAccessories(productId: bigint, accessories: Array<{ name: string; quantityPerSet: number }>) {
    await prisma.productAccessory.deleteMany({ where: { productId } });
    for (const item of accessories) {
      const name = item.name.trim();
      if (!name) continue;
      const accessory =
        (await prisma.accessory.findFirst({ where: { name, deletedAt: null } })) ??
        (await prisma.accessory.create({ data: { name, price: 0, stock: 0 } }));
      await prisma.productAccessory.upsert({
        where: { productId_accessoryId: { productId, accessoryId: accessory.id } },
        update: { quantityPerSet: item.quantityPerSet },
        create: { productId, accessoryId: accessory.id, quantityPerSet: item.quantityPerSet },
      });
    }
  }

  static async updateVariants(
    productId: bigint,
    variants: Array<{ size: string; stockRent: number; stockBuy?: number; stockInService?: number; serviceNote?: string | null; priceRentOverride?: number | null }>,
  ) {
    await this.getById(productId);
    for (const v of variants) {
      const size = v.size?.trim();
      if (!size) continue;
      const stockRent = Math.max(0, Math.floor(Number(v.stockRent) || 0));
      const stockInService = Math.min(stockRent, Math.max(0, Math.floor(Number(v.stockInService) || 0)));
      const data = {
        stockRent,
        stockBuy: Math.max(0, Math.floor(Number(v.stockBuy) || 0)),
        stockInService,
        serviceNote: v.serviceNote || null,
        priceRentOverride: v.priceRentOverride ? v.priceRentOverride : null,
        deletedAt: null,
      };
      await prisma.productVariant.upsert({
        where: { productId_size: { productId, size } },
        update: data,
        create: { productId, size, ...data },
      });
    }
    await RedisService.delPattern('products:*');
    return this.getById(productId);
  }

  static async update(id: bigint, data: any) {
    await this.getById(id);

    const { variants, accessories, ...updateData } = data;
    if (accessories) await this.syncAccessories(id, accessories);
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
        productAccessories: { include: { accessory: true } },
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

