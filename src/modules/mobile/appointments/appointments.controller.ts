import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileAppointmentsService } from './appointments.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const list = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await MobileAppointmentsService.list(req.query as any);
    return sendSuccess(res, 'Daftar jadwal berhasil diambil', data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await MobileAppointmentsService.create(req.user!.id, req.body);
    return sendSuccess(res, 'Jadwal berhasil dibuat', data, 201);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    await MobileAppointmentsService.remove(toBigInt(req.params.id));
    return sendSuccess(res, 'Jadwal berhasil dihapus');
  } catch (error) {
    next(error);
  }
};
