import { z } from 'zod';

export const createOrderSchema = z.object({
  orderType: z.enum(['beli', 'sewa', 'custom']),
  requiresProduction: z.boolean().default(false),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      itemType: z.enum(['product', 'accessory']),
      productId: z.union([z.string(), z.number()]).optional().transform((val) => (val ? BigInt(val) : undefined)),
      productVariantId: z.union([z.string(), z.number()]).optional().transform((val) => (val ? BigInt(val) : undefined)),
      accessoryId: z.union([z.string(), z.number()]).optional().transform((val) => (val ? BigInt(val) : undefined)),
      quantity: z.number().int().min(1, 'Jumlah minimal 1'),
      size: z.string().optional(),
      unitPrice: z.number().min(0, 'Harga satuan minimal 0'),
    })
  ).min(1, 'Order harus memiliki minimal 1 item'),
  rentalDetail: z
    .object({
      pickupDate: z.string(),
      returnDate: z.string(),
    })
    .optional(),
  customDetail: z
    .object({
      designReference: z.string().optional(),
      designDescription: z.string().optional(),
      jenisJenjang: z.string().optional(),
      consultationNote: z.string().optional(),
    })
    .optional(),
});
