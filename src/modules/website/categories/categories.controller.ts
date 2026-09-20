import { Request, Response, NextFunction } from 'express';
import { WebsiteCategoriesService } from './categories.service';
import { sendSuccess } from '../../../shared/utils/response';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await WebsiteCategoriesService.getAll();
    return sendSuccess(res, 'Daftar kategori berhasil diambil', categories);
  } catch (error) {
    next(error);
  }
};
