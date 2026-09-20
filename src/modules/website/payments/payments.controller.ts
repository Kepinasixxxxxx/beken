import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsitePaymentsService } from './payments.service';
import { sendSuccess } from '../../../shared/utils/response';
import { AppError } from '../../../middlewares/error-handler';

export const uploadPaymentProof = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    if (!file) {
      throw new AppError('File bukti transfer wajib diunggah.', 400);
    }

    const { orderId, paymentType, amount, paymentMethod } = req.body;
    if (!orderId || !paymentType || !amount) {
      throw new AppError('orderId, paymentType, dan amount wajib diisi.', 400);
    }

    const payment = await WebsitePaymentsService.uploadPaymentProof(userId, {
      orderId: BigInt(orderId),
      paymentType,
      amount: parseFloat(amount),
      paymentMethod,
      proofImage: `/uploads/payments/${file.filename}`,
    });

    return sendSuccess(res, 'Bukti pembayaran berhasil diunggah', payment, 201);
  } catch (error) {
    next(error);
  }
};
