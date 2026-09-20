import { Request, Response, NextFunction } from 'express';
import { WebsiteStoreProfileService } from './store-profile.service';
import { sendSuccess } from '../../../shared/utils/response';

export const getProfile = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await WebsiteStoreProfileService.getProfile();
    return sendSuccess(res, 'Profil toko berhasil diambil', profile);
  } catch (error) {
    next(error);
  }
};
