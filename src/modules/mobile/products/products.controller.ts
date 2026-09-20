import { Request, Response, NextFunction } from 'express';
import { MobileProductsService } from './products.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await MobileProductsService.getAll();
    return sendSuccess(res, 'Daftar produk berhasil diambil', products);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const product = await MobileProductsService.getById(id);
    return sendSuccess(res, 'Detail produk berhasil diambil', product);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await MobileProductsService.create(req.body);
    return sendSuccess(res, 'Produk berhasil dibuat', product, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const product = await MobileProductsService.update(id, req.body);
    return sendSuccess(res, 'Produk berhasil diperbarui', product);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    await MobileProductsService.softDelete(id);
    return sendSuccess(res, 'Produk berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map((file) => `/uploads/products/${file.filename}`);
    const product = await MobileProductsService.addImages(id, imageUrls);
    return sendSuccess(res, 'Gambar produk berhasil diupload', product);
  } catch (error) {
    next(error);
  }
};

export const toggleVisibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const { isVisible } = req.body;
    const product = await MobileProductsService.toggleVisibility(id, Boolean(isVisible));
    return sendSuccess(res, 'Status visibilitas produk diperbarui', product);
  } catch (error) {
    next(error);
  }
};
