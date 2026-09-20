import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileAdminsService } from './admins.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (_req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const admins = await MobileAdminsService.getAll();
    return sendSuccess(res, 'Daftar akun admin berhasil diambil', admins);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const admin = await MobileAdminsService.getById(id);
    return sendSuccess(res, 'Detail admin berhasil diambil', admin);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await MobileAdminsService.create(req.body);
    return sendSuccess(res, 'Akun admin berhasil dibuat', admin, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const admin = await MobileAdminsService.update(id, req.body);
    return sendSuccess(res, 'Akun admin berhasil diperbarui', admin);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await MobileAdminsService.delete(id);
    return sendSuccess(res, 'Akun admin berhasil dihapus');
  } catch (error) {
    next(error);
  }
};
