import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt';
import { AppError } from '../error-handler';
import { prisma } from '../../config/prisma';

export interface AuthenticatedUserRequest extends Request {
  user?: {
    id: bigint;
    type: 'user';
    email: string;
    name: string;
  };
}

export const authenticateWebsite = async (
  req: AuthenticatedUserRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('Sesi tidak valid atau telah berakhir. Silakan login kembali.', 401);
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== 'user') {
      throw new AppError('Akses ditolak. Token tidak sesuai untuk klien Website.', 403);
    }

    const userId = BigInt(payload.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError('Akun pengguna tidak ditemukan.', 401);
    }

    req.user = {
      id: user.id,
      type: 'user',
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError('Sesi tidak valid atau telah expired.', 401));
  }
};
