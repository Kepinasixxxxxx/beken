import { Request, Response, NextFunction } from 'express';
import { WebsiteAuthService } from './auth.service';
import { sendSuccess } from '../../../shared/utils/response';
import { env } from '../../../config/env';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WebsiteAuthService.register(req.body);
    res.cookie('accessToken', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    return sendSuccess(res, 'Registrasi berhasil', { user: result.user }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WebsiteAuthService.login(req.body);
    res.cookie('accessToken', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    return sendSuccess(res, 'Login berhasil', { user: result.user });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = await WebsiteAuthService.refresh(refreshToken);
    res.cookie('accessToken', result.accessToken, cookieOptions);
    return sendSuccess(res, 'Token berhasil diperbarui');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await WebsiteAuthService.logout(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return sendSuccess(res, 'Logout berhasil');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WebsiteAuthService.forgotPassword(req.body.email);
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WebsiteAuthService.resetPassword(req.body);
    return sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};
