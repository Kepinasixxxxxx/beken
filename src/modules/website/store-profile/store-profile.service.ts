import { prisma } from '../../../config/prisma';

export class WebsiteStoreProfileService {
  static async getProfile() {
    return prisma.storeProfile.findFirst();
  }
}
