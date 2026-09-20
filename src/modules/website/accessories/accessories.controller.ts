import { Request, Response, NextFunction } from 'express';
import { WebsiteAccessoriesService } from './accessories.service';
import { sendSuccess } from '../../../shared/utils/response';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const accessories = await WebsiteAccessoriesService.getAll();
    return sendSuccess(res, 'Daftar aksesoris berhasil diambil', accessories);
  } catch (error) {
    next(error);
  }
};
