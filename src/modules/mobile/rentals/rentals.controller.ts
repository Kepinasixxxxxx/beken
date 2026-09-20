import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileRentalsService } from './rentals.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getCalendar = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const rentals = await MobileRentalsService.getBookingCalendar(startDate as string, endDate as string);
    return sendSuccess(res, 'Kalender booking sewa berhasil diambil', rentals);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const updated = await MobileRentalsService.updateRentalStatus(id, req.body);
    return sendSuccess(res, 'Status penyewaan berhasil diperbarui', updated);
  } catch (error) {
    next(error);
  }
};
