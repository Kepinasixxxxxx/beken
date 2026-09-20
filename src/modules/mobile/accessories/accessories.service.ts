import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class MobileAccessoriesService {
  static async getAll() {
    return prisma.accessory.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'desc' },
    });
  }

  static async getById(id: bigint) {
    const accessory = await prisma.accessory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!accessory) throw new AppError('Aksesoris tidak ditemukan', 404);
    return accessory;
  }

  static async create(data: { name: string; description?: string; price: number; stock: number; imageUrl?: string }) {
    return prisma.accessory.create({ data });
  }

  static async update(id: bigint, data: any) {
    await this.getById(id);
    return prisma.accessory.update({ where: { id }, data });
  }

  static async delete(id: bigint) {
    await this.getById(id);
    return prisma.accessory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
