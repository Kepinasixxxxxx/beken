import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileRentalsService } from './rentals.service';
import { MobileRentalOpsService } from './rentals.operations.service';
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

export const handover = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { pickupTime, returnTime, depositAmount, conditionNote } = req.body;
    const rental = await MobileRentalOpsService.handover(toBigInt(req.params.id), req.user!.id, {
      pickupTime: pickupTime || undefined,
      returnTime: returnTime || undefined,
      depositAmount: depositAmount != null && depositAmount !== '' ? Number(depositAmount) : undefined,
      conditionNote,
      agreementPhoto: file ? `/uploads/rentals/${file.filename}` : undefined,
    });
    return sendSuccess(res, 'Kostum berhasil diserahkan', rental);
  } catch (error) {
    next(error);
  }
};

export const refund = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { refundAmount, refundBank, refundAccount, refundHolder } = req.body;
    const rental = await MobileRentalOpsService.refund(toBigInt(req.params.id), {
      refundAmount: Number(refundAmount),
      refundBank,
      refundAccount,
      refundHolder,
      refundProofImage: file ? `/uploads/payments/${file.filename}` : undefined,
    });
    return sendSuccess(res, 'Refund deposit berhasil dicatat', rental);
  } catch (error) {
    next(error);
  }
};
