import { prisma } from '../../../config/prisma';
import { hashPassword } from '../../../shared/utils/hash';
import { AppError } from '../../../middlewares/error-handler';

export class MobileAdminsService {
  static async getAll() {
    return prisma.admin.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: bigint) {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!admin) throw new AppError('Admin tidak ditemukan.', 404);
    return admin;
  }

  static async create(data: { name: string; email: string; password: string; phone?: string; role: 'owner' | 'staff' }) {
    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email admin sudah terdaftar.', 409);

    const passwordHash = await hashPassword(data.password);
    return prisma.admin.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  }

  static async update(id: bigint, data: { name?: string; phone?: string; role?: 'owner' | 'staff'; password?: string }) {
    await this.getById(id);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.passwordHash = await hashPassword(data.password);

    return prisma.admin.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }

  static async delete(id: bigint) {
    await this.getById(id);
    return prisma.admin.delete({ where: { id } });
  }
}
