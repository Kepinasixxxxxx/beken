import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileAccountService } from './account.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getProfile = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await MobileAccountService.getProfile(req.user!.id);
    return sendSuccess(res, 'Profil admin berhasil diambil', admin);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const admin = await MobileAccountService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, 'Profil admin berhasil diperbarui', admin);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAccountService.changePassword(req.user!.id, req.body);
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

export const getSecurity = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await MobileAccountService.getSecurity(req.user!.id);
    return sendSuccess(res, 'Pengaturan keamanan berhasil diambil', data);
  } catch (error) {
    next(error);
  }
};

export const setPin = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAccountService.setPin(req.user!.id, req.body);
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await MobileAccountService.updateSettings(req.user!.id, req.body);
    return sendSuccess(res, 'Pengaturan berhasil disimpan', data);
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAccountService.revokeSession(req.user!.id, toBigInt(req.params.id));
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};
