import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsiteOrdersService } from './orders.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const createOrder = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const order = await WebsiteOrdersService.createOrder(userId, req.body);
    return sendSuccess(res, 'Pesanan berhasil dibuat', order, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orders = await WebsiteOrdersService.getUserOrders(userId);
    return sendSuccess(res, 'Daftar pesanan berhasil diambil', orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderDetail = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orderId = toBigInt(req.params.id);
    const order = await WebsiteOrdersService.getOrderDetail(userId, orderId);
    return sendSuccess(res, 'Detail pesanan berhasil diambil', order);
  } catch (error) {
    next(error);
  }
};

export const getStatusHistory = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orderId = toBigInt(req.params.id);
    const history = await WebsiteOrdersService.getOrderStatusHistory(userId, orderId);
    return sendSuccess(res, 'Riwayat status pesanan berhasil diambil', history);
  } catch (error) {
    next(error);
  }
};
