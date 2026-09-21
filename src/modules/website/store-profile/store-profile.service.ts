import { prisma } from '../../../config/prisma';
import { RedisService } from '../../../shared/services/redis.service';

export class WebsiteStoreProfileService {
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
}

