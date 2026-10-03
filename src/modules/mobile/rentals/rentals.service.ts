import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class MobileRentalsService {
  static async getBookingCalendar(startDateStr?: string, endDateStr?: string) {
    const where: any = {
      order: { status: { not: 'dibatalkan' } },
    };

    if (startDateStr && endDateStr) {
      where.pickupDate = { lte: new Date(endDateStr) };
      where.returnDate = { gte: new Date(startDateStr) };
    }

    return prisma.rental.findMany({
      where,
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
            items: { include: { product: true, productVariant: true } },
          },
        },
      },
      orderBy: { pickupDate: 'asc' },
    });
  }

  static async updateRentalStatus(rentalId: bigint, data: { status: 'diambil' | 'dikembalikan' | 'terlambat'; itemConditionBefore?: string; itemConditionAfter?: string; damageNote?: string; penaltyAmount?: number }) {
    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental) throw new AppError('Data sewa tidak ditemukan.', 404);

    const isReturning = data.status === 'dikembalikan';
    const actualReturnDate = isReturning ? new Date() : rental.actualReturnDate;

    return prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: data.status,
        actualReturnDate,
        itemConditionBefore: data.itemConditionBefore || rental.itemConditionBefore,
        itemConditionAfter: data.itemConditionAfter || rental.itemConditionAfter,
        damageNote: data.damageNote || rental.damageNote,
        penaltyAmount: data.penaltyAmount !== undefined ? data.penaltyAmount : rental.penaltyAmount,
        refundStatus: isReturning && Number(rental.depositAmount ?? 0) > 0 && !rental.refundStatus ? 'menunggu' : rental.refundStatus,
      },
      include: {
        order: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
    });
  }
}
