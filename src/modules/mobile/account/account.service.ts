import { prisma } from '../../../config/prisma';
import { hashPassword, comparePassword } from '../../../shared/utils/hash';
import { AppError } from '../../../middlewares/error-handler';

export class MobileAccountService {
  static async getProfile(adminId: bigint) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!admin) throw new AppError('Profil admin tidak ditemukan.', 404);
    return admin;
  }

  static async updateProfile(adminId: bigint, data: { name?: string; phone?: string }) {
    return prisma.admin.update({
      where: { id: adminId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }

  static async changePassword(adminId: bigint, data: { oldPassword: string; newPassword: string }) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError('Admin tidak ditemukan.', 404);

    const isValid = await comparePassword(data.oldPassword, admin.passwordHash);
    if (!isValid) throw new AppError('Password lama salah.', 400);

    const newHash = await hashPassword(data.newPassword);
    await prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash: newHash, passwordChangedAt: new Date() },
    });

    return { message: 'Password admin berhasil diubah.' };
  }
}
