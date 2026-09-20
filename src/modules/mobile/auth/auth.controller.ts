import { Request, Response, NextFunction } from 'express';
import { MobileAuthService } from './auth.service';
import { sendSuccess } from '../../../shared/utils/response';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAuthService.login(req.body);
    return sendSuccess(res, 'Login admin berhasil', result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAuthService.refresh(req.body.refreshToken);
    return sendSuccess(res, 'Token berhasil diperbarui', result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await MobileAuthService.logout(req.body.refreshToken);
    return sendSuccess(res, 'Logout admin berhasil');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAuthService.forgotPassword(req.body.email);
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAuthService.resetPassword(req.body);
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};
