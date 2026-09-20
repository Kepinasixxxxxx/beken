import { Request, Response, NextFunction } from 'express';
import { MobileAccessoriesService } from './accessories.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const accessories = await MobileAccessoriesService.getAll();
    return sendSuccess(res, 'Daftar aksesoris berhasil diambil', accessories);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const accessory = await MobileAccessoriesService.getById(id);
    return sendSuccess(res, 'Detail aksesoris berhasil diambil', accessory);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessory = await MobileAccessoriesService.create(req.body);
    return sendSuccess(res, 'Aksesoris berhasil dibuat', accessory, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const accessory = await MobileAccessoriesService.update(id, req.body);
    return sendSuccess(res, 'Aksesoris berhasil diperbarui', accessory);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await MobileAccessoriesService.delete(id);
    return sendSuccess(res, 'Aksesoris berhasil dihapus');
  } catch (error) {
    next(error);
  }
};
