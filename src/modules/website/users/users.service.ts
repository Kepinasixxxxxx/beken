import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class WebsiteUsersService {
  static async getProfile(userId: bigint) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePhoto: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError('Profil pengguna tidak ditemukan.', 404);
    return user;
  }

  static async updateProfile(userId: bigint, data: { name?: string; phone?: string; address?: string; profilePhoto?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePhoto: true,
      },
    });
  }
}
