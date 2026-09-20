import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsiteNotificationsService } from './notifications.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getNotifications = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await WebsiteNotificationsService.getNotifications(req.user!.id);
    return sendSuccess(res, 'Notifikasi berhasil diambil', notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await WebsiteNotificationsService.markAsRead(req.user!.id, id);
    return sendSuccess(res, 'Notifikasi ditandai telah dibaca');
  } catch (error) {
    next(error);
  }
};
