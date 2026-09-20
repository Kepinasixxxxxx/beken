import { prisma } from '../../../config/prisma';

export class WebsiteAccessoriesService {
  static async getAll() {
    return prisma.accessory.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'desc' },
    });
  }
}
