import { Request, Response, NextFunction } from 'express';
import { WebsiteProductsService } from './products.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await WebsiteProductsService.getAll(req.query as any);
    return sendSuccess(res, 'Daftar produk berhasil diambil', products);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toBigInt(req.params.id);
    const product = await WebsiteProductsService.getById(id);
    return sendSuccess(res, 'Detail produk berhasil diambil', product);
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = toBigInt(req.params.id);
    const variantId = req.query.variantId ? toBigInt(req.query.variantId as string) : null;
    const { pickupDate, returnDate } = req.query;

    const availability = await WebsiteProductsService.getAvailability(
      productId,
      variantId,
      pickupDate as string,
      returnDate as string
    );
    return sendSuccess(res, 'Ketersediaan stok sewa berhasil diperiksa', availability);
  } catch (error) {
    next(error);
  }
};
