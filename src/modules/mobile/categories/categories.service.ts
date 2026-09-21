import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { RedisService } from '../../../shared/services/redis.service';

export class MobileCategoriesService {
  static async getAll() {
    const cacheKey = 'categories:mobile:all';
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });

    await RedisService.set(cacheKey, categories, 3600);
    return categories;
  }

  static async getById(id: bigint) {
    const cacheKey = `categories:detail:${id.toString()}`;
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError('Kategori tidak ditemukan', 404);

    await RedisService.set(cacheKey, category, 3600);
    return category;
  }

  static async create(data: { name: string; description?: string }) {
    const result = await prisma.category.create({ data });
    await RedisService.delPattern('categories:*');
    return result;
  }

  static async update(id: bigint, data: { name?: string; description?: string }) {
    await this.getById(id);
    const result = await prisma.category.update({ where: { id }, data });
    await RedisService.delPattern('categories:*');
    return result;
  }

  static async delete(id: bigint) {
    await this.getById(id);
    const result = await prisma.category.delete({ where: { id } });
    await RedisService.delPattern('categories:*');
    return result;
  }
}

