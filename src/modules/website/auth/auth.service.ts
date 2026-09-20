import { prisma } from '../../../config/prisma';
import { hashPassword, comparePassword } from '../../../shared/utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../shared/utils/jwt';
import { AppError } from '../../../middlewares/error-handler';
import crypto from 'crypto';

export class WebsiteAuthService {
  static async register(data: { name: string; email: string; password: string; phone?: string; address?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email sudah terdaftar.', 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        address: data.address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    const payload = { id: user.id.toString(), type: 'user' as const };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        accountType: 'user',
        accountId: user.id,
        tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.passwordHash) {
      throw new AppError('Email atau password salah.', 401);
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Email atau password salah.', 401);
    }

    const payload = { id: user.id.toString(), type: 'user' as const };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        accountType: 'user',
        accountId: user.id,
        tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePhoto: user.profilePhoto,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token diperlukan.', 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'user') {
      throw new AppError('Invalid token type.', 403);
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        accountType: 'user',
        accountId: BigInt(payload.id),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new AppError('Refresh token tidak valid atau telah dicabut.', 401);
    }

    const newAccessToken = generateAccessToken({ id: payload.id, type: 'user' });
    return { accessToken: newAccessToken };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'Jika email terdaftar, kode OTP reset password telah dikirim.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.passwordReset.create({
      data: {
        accountType: 'user',
        accountId: user.id,
        otpCode,
        expiresAt,
      },
    });

    console.log(`[DEV OTP] Website User OTP for ${email}: ${otpCode}`);
    return { message: 'Kode OTP telah dibuat. Silakan periksa inbox/console dev.' };
  }

  static async resetPassword(data: { email: string; otpCode: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Email tidak ditemukan.', 404);

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        accountType: 'user',
        accountId: user.id,
        otpCode: data.otpCode,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      throw new AppError('Kode OTP tidak valid atau telah kadaluwarsa.', 400);
    }

    const newHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { isUsed: true },
    });

    return { message: 'Password berhasil diperbarui. Silakan login kembali.' };
  }
}
