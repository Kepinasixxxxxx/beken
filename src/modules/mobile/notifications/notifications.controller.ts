import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileNotificationsService } from './notifications.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getNotifications = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await MobileNotificationsService.getNotifications(req.user!.id);
    return sendSuccess(res, 'Notifikasi admin berhasil diambil', notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await MobileNotificationsService.markAsRead(req.user!.id, id);
    return sendSuccess(res, 'Notifikasi ditandai telah dibaca');
  } catch (error) {
    next(error);
  }
};
