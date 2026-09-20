import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from './authenticate';
import { AppError } from '../error-handler';

export const authorizeRoles = (...roles: ('owner' | 'staff')[]) => {
  return (req: AuthenticatedAdminRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Pengguna belum terautentikasi.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Akses ditolak. Fitur ini hanya untuk role: ${roles.join(', ')}`, 403)
      );
    }

    next();
  };
};
