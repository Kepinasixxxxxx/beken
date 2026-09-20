import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsiteTestimonialsService } from './testimonials.service';
import { sendSuccess } from '../../../shared/utils/response';
import { AppError } from '../../../middlewares/error-handler';

export const getPublic = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const testimonials = await WebsiteTestimonialsService.getPublic();
    return sendSuccess(res, 'Daftar testimoni berhasil diambil', testimonials);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { orderId, rating, comment } = req.body;
    if (!orderId || !rating) {
      throw new AppError('orderId dan rating wajib diisi', 400);
    }

    const testimonial = await WebsiteTestimonialsService.create(userId, {
      orderId: BigInt(orderId),
      rating: parseInt(rating, 10),
      comment,
    });

    return sendSuccess(res, 'Testimoni berhasil dibuat', testimonial, 201);
  } catch (error) {
    next(error);
  }
};
