import { prisma } from '../../../config/prisma';

export class MobileStoreProfileService {
  static async getProfile() {
    return prisma.storeProfile.findFirst();
  }

  static async updateProfile(data: any) {
    const existing = await prisma.storeProfile.findFirst();
    if (existing) {
      return prisma.storeProfile.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.storeProfile.create({ data });
  }
}
