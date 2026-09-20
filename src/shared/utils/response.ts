import { Response } from 'express';

// Ensure BigInt values convert gracefully when serialized to JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const sendSuccess = (
  res: Response,
  message: string,
  data?: any,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data !== undefined ? data : null,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Record<string, string[]>
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

export const toBigInt = (val: string | string[] | undefined | null): bigint => {
  if (!val) return BigInt(0);
  const str = Array.isArray(val) ? val[0] : val;
  return BigInt(str);
};

