import { prisma } from '../../../config/prisma';
import { RedisService } from '../../../shared/services/redis.service';

export class WebsiteCategoriesService {
  static async getAll() {
    const cacheKey = 'categories:website:all';
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            products: {
              where: { deletedAt: null, isVisible: true },
            },
          },
        },
      },
    });

    await RedisService.set(cacheKey, categories, 3600);
    return categories;
  }
}

