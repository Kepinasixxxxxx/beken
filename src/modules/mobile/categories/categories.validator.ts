import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(100),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
