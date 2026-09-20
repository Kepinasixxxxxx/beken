import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt';
import { AppError } from '../error-handler';
import { prisma } from '../../config/prisma';

export interface AuthenticatedAdminRequest extends Request {
  user?: {
    id: bigint;
    type: 'admin';
    email: string;
    name: string;
    role: 'owner' | 'staff';
  };
}

export const authenticateMobile = async (
  req: AuthenticatedAdminRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Header otorisasi (Bearer Token) diperlukan.', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== 'admin') {
      throw new AppError('Akses ditolak. Token tidak sesuai untuk klien Mobile Admin.', 403);
    }

    const adminId = BigInt(payload.id);
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin) {
      throw new AppError('Akun admin tidak ditemukan.', 401);
    }

    req.user = {
      id: admin.id,
      type: 'admin',
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError('Sesi admin tidak valid atau telah expired.', 401));
  }
};
