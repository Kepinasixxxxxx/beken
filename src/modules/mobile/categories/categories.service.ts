import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class MobileCategoriesService {
  static async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });
  }

  static async getById(id: bigint) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new AppError('Kategori tidak ditemukan', 404);
    return category;
  }

  static async create(data: { name: string; description?: string }) {
    return prisma.category.create({ data });
  }

  static async update(id: bigint, data: { name?: string; description?: string }) {
    await this.getById(id);
    return prisma.category.update({ where: { id }, data });
  }

  static async delete(id: bigint) {
    await this.getById(id);
    return prisma.category.delete({ where: { id } });
  }
}
