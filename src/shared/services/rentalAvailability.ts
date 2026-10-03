import { prisma } from '../../config/prisma';

export const checkRentalAvailability = async (
  productId: bigint,
  productVariantId: bigint | null,
  pickupDate: Date,
  returnDate: Date
): Promise<{ availableStock: number; totalStock: number }> => {
  // Find total stock
  let totalStock = 0;
  if (productVariantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });
    totalStock = variant ? variant.stockRent - variant.stockInService : 0;
  } else {
    const variants = await prisma.productVariant.findMany({
      where: { productId, deletedAt: null },
    });
    totalStock = variants.reduce((sum, v) => sum + v.stockRent - v.stockInService, 0);
  }

  // Calculate rented quantity by checking order_items quantity for overlapping rentals
  // Overlap: rental.pickup_date <= requested.return_date AND rental.return_date >= requested.pickup_date
  const overlappingOrders = await prisma.orderItem.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      productId,
      ...(productVariantId ? { productVariantId } : {}),
      order: {
        status: { not: 'dibatalkan' },
        rental: {
          pickupDate: { lte: returnDate },
          returnDate: { gte: pickupDate },
        },
      },
    },
  });

  const bookedCount = overlappingOrders._sum.quantity || 0;
  const availableStock = Math.max(0, totalStock - bookedCount);

  return { availableStock, totalStock };
};
