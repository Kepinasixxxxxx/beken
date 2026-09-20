import { prisma } from '../../../config/prisma';

export class WebsiteCategoriesService {
  static async getAll() {
    return prisma.category.findMany({
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
  }
}
