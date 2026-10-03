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

  static async getSecurity(adminId: bigint) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError('Admin tidak ditemukan.', 404);
    const sessions = await prisma.refreshToken.findMany({
      where: { accountType: 'admin', accountId: adminId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, deviceName: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      hasPin: admin.pinHash != null,
      passwordChangedAt: admin.passwordChangedAt,
      autoAcceptOrders: admin.autoAcceptOrders,
      sessions,
    };
  }

  static async setPin(adminId: bigint, data: { pin: string; currentPin?: string; password: string }) {
    if (!/^\d{6}$/.test(data.pin ?? '')) throw new AppError('PIN harus 6 digit angka.', 400);
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError('Admin tidak ditemukan.', 404);
    const passwordOk = await comparePassword(data.password ?? '', admin.passwordHash);
    if (!passwordOk) throw new AppError('Kata sandi salah.', 400);
    await prisma.admin.update({ where: { id: adminId }, data: { pinHash: await hashPassword(data.pin) } });
    return { message: 'PIN otorisasi berhasil disimpan.' };
  }

  static async updateSettings(adminId: bigint, data: { autoAcceptOrders?: boolean }) {
    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: { autoAcceptOrders: data.autoAcceptOrders },
      select: { autoAcceptOrders: true },
    });
    return updated;
  }

  static async revokeSession(adminId: bigint, sessionId: bigint) {
    const session = await prisma.refreshToken.findFirst({ where: { id: sessionId, accountType: 'admin', accountId: adminId } });
    if (!session) throw new AppError('Sesi tidak ditemukan.', 404);
    await prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
    return { message: 'Perangkat berhasil dikeluarkan.' };
  }

  static async assertPin(adminId: bigint, pin?: string) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { pinHash: true } });
    if (!admin?.pinHash) return;
    if (!pin) throw new AppError('PIN otorisasi diperlukan untuk aksi ini.', 403);
    const ok = await comparePassword(pin, admin.pinHash);
    if (!ok) throw new AppError('PIN otorisasi salah.', 403);
  }
}
