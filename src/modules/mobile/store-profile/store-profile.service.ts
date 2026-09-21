import { prisma } from '../../../config/prisma';
import { RedisService } from '../../../shared/services/redis.service';

export class MobileStoreProfileService {
  static async getProfile() {
    const cacheKey = 'store_profile:main';
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const profile = await prisma.storeProfile.findFirst();
    if (profile) {
      await RedisService.set(cacheKey, profile, 86400);
    }
    return profile;
  }

  static async updateProfile(data: any) {
    const existing = await prisma.storeProfile.findFirst();
    let result;
    if (existing) {
      result = await prisma.storeProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      result = await prisma.storeProfile.create({ data });
    }

    await RedisService.del('store_profile:main');
    return result;
  }
}

