import { z } from 'zod';

export const mobileLoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

export const mobileRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token diperlukan'),
});

export const mobileLogoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export const mobileForgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const mobileResetPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
  otpCode: z.string().length(6, 'Kode OTP 6 digit'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
});
