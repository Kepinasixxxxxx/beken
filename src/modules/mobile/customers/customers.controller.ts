import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileCustomersService } from './customers.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const customers = await MobileCustomersService.getAll(search);
    return sendSuccess(res, 'Daftar pelanggan berhasil diambil', customers);
  } catch (error) {
    next(error);
  }
};

export const getDetail = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const customer = await MobileCustomersService.getDetail(id);
    return sendSuccess(res, 'Detail pelanggan berhasil diambil', customer);
  } catch (error) {
    next(error);
  }
};
