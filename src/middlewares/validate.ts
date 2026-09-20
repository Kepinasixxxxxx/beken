import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error-handler';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.') || 'body';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(err.message);
        });
        next(new AppError('Validasi data gagal', 400, formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
