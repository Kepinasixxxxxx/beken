import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileStoreProfileService } from './store-profile.service';
import { sendSuccess } from '../../../shared/utils/response';

export const getProfile = async (_req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await MobileStoreProfileService.getProfile();
    return sendSuccess(res, 'Profil toko berhasil diambil', profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await MobileStoreProfileService.updateProfile(req.body);
    return sendSuccess(res, 'Profil toko berhasil diperbarui', profile);
  } catch (error) {
    next(error);
  }
};
