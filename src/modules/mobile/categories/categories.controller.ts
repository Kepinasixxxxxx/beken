import { Request, Response, NextFunction } from 'express';
import { MobileCategoriesService } from './categories.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await MobileCategoriesService.getAll();
    return sendSuccess(res, 'Daftar kategori berhasil diambil', categories);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const category = await MobileCategoriesService.getById(id);
    return sendSuccess(res, 'Detail kategori berhasil diambil', category);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await MobileCategoriesService.create(req.body);
    return sendSuccess(res, 'Kategori berhasil dibuat', category, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const category = await MobileCategoriesService.update(id, req.body);
    return sendSuccess(res, 'Kategori berhasil diperbarui', category);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await MobileCategoriesService.delete(id);
    return sendSuccess(res, 'Kategori berhasil dihapus');
  } catch (error) {
    next(error);
  }
};
