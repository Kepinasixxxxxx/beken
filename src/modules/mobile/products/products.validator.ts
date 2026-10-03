import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.union([z.string(), z.number()]).transform((val) => BigInt(val)),
  name: z.string().min(2, 'Nama produk minimal 2 karakter').max(150),
  description: z.string().optional(),
  basePriceBuy: z.number().optional(),
  basePriceRent: z.number().optional(),
  isCustomAvailable: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  sku: z.string().max(40).optional(),
  conditionGrade: z.enum(['A', 'B', 'C']).optional(),
  accessories: z.array(z.object({ name: z.string().min(1), quantityPerSet: z.number().int().min(1).default(1) })).optional(),
  variants: z
    .array(
      z.object({
        size: z.string().min(1, 'Ukuran wajib diisi'),
        stockBuy: z.number().min(0).default(0),
        stockRent: z.number().min(0).default(0),
        priceBuyOverride: z.number().optional(),
        priceRentOverride: z.number().optional(),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();
