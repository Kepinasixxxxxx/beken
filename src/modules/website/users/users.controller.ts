import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsiteUsersService } from './users.service';
import { sendSuccess } from '../../../shared/utils/response';

export const getProfile = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const user = await WebsiteUsersService.getProfile(req.user!.id);
    return sendSuccess(res, 'Profil pengguna berhasil diambil', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const user = await WebsiteUsersService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, 'Profil pengguna berhasil diperbarui', user);
  } catch (error) {
    next(error);
  }
};
