import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileAccountService } from '../account/account.service';
import { MobilePaymentsService } from './payments.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await MobilePaymentsService.getAll(req.query as any);
    return sendSuccess(res, 'Daftar pembayaran berhasil diambil', payments);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const paymentId = toBigInt(req.params.id);
    const adminId = req.user!.id;
    const { status, refundReason, pin } = req.body;
    if (status === 'terverifikasi') await MobileAccountService.assertPin(adminId, pin);
    const payment = await MobilePaymentsService.verifyPayment(paymentId, adminId, status, refundReason);
    return sendSuccess(res, `Pembayaran berhasil ${status}`, payment);
  } catch (error) {
    next(error);
  }
};
