import { z } from 'zod';

export const createAccessorySchema = z.object({
  name: z.string().min(2, 'Nama aksesoris minimal 2 karakter').max(150),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga harus angka positif'),
  stock: z.number().int().min(0, 'Stok minimal 0'),
  imageUrl: z.string().optional(),
});

export const updateAccessorySchema = createAccessorySchema.partial();
