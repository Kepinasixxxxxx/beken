import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileOrdersService } from './orders.service';
import { RentalAgreementService } from './rental-agreement.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await MobileOrdersService.getAll(req.query as any);
    return sendSuccess(res, 'Daftar pesanan berhasil diambil', orders);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const order = await MobileOrdersService.getById(id);
    return sendSuccess(res, 'Detail pesanan berhasil diambil', order);
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const adminId = req.user!.id;
    const { dpAmount } = req.body;
    const order = await MobileOrdersService.confirmOrder(id, adminId, dpAmount);
    return sendSuccess(res, 'Pesanan berhasil dikonfirmasi', order);
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const adminId = req.user!.id;
    const { progressPercentage, statusLabel, note } = req.body;
    const history = await MobileOrdersService.updateProgress(id, adminId, {
      progressPercentage: parseInt(progressPercentage, 10),
      statusLabel,
      note,
    });
    return sendSuccess(res, 'Perkembangan produksi berhasil diperbarui', history);
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const adminId = req.user!.id;
    const { status, note } = req.body;
    const order = await MobileOrdersService.changeStatus(id, adminId, status, note);
    return sendSuccess(res, 'Status pesanan berhasil diubah', order);
  } catch (error) {
    next(error);
  }
};

export const rentalAgreementPdf = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await RentalAgreementService.generate(id, res);
  } catch (error) {
    next(error);
  }
};
