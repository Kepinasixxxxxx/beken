import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class MobileRentalOpsService {
  static async handover(
    rentalId: bigint,
    adminId: bigint,
    data: { pickupTime?: string; returnTime?: string; depositAmount?: number; conditionNote?: string; agreementPhoto?: string },
  ) {
    const rental = await prisma.rental.findUnique({ where: { id: rentalId }, include: { order: true } });
    if (!rental) throw new AppError('Data sewa tidak ditemukan.', 404);
    if (rental.status !== 'dipesan') throw new AppError('Kostum untuk sewa ini sudah diserahkan.', 400);
    if (data.pickupTime && !TIME_PATTERN.test(data.pickupTime)) throw new AppError('Format jam ambil harus HH:MM.', 400);
    if (data.returnTime && !TIME_PATTERN.test(data.returnTime)) throw new AppError('Format jam kembali harus HH:MM.', 400);

    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'diambil',
        pickupTime: data.pickupTime ?? rental.pickupTime,
        returnTime: data.returnTime ?? rental.returnTime,
        depositAmount: data.depositAmount ?? rental.depositAmount,
        itemConditionBefore: data.conditionNote || rental.itemConditionBefore,
        agreementPhoto: data.agreementPhoto ?? rental.agreementPhoto,
        handoverAdminId: adminId,
        handoverAt: new Date(),
      },
    });

    await dispatchNotification({
      recipientType: 'user',
      recipientId: rental.order.userId,
      type: 'RENTAL_HANDOVER',
      title: 'Kostum Sudah Diserahkan',
      message: `Kostum untuk sewa ${rental.order.orderNumber} sudah diserahkan. Harap kembalikan sesuai jadwal.`,
      relatedOrderId: rental.orderId,
    });

    return updated;
  }

  static async refund(
    rentalId: bigint,
    data: { refundAmount: number; refundBank?: string; refundAccount?: string; refundHolder?: string; refundProofImage?: string },
  ) {
    const rental = await prisma.rental.findUnique({ where: { id: rentalId }, include: { order: true } });
    if (!rental) throw new AppError('Data sewa tidak ditemukan.', 404);
    if (rental.status !== 'dikembalikan') throw new AppError('Refund hanya bisa diproses setelah kostum dikembalikan.', 400);
    if (rental.refundStatus === 'selesai') throw new AppError('Deposit untuk sewa ini sudah dikembalikan.', 400);
    if (!Number.isFinite(data.refundAmount) || data.refundAmount < 0) throw new AppError('Nominal refund tidak valid.', 400);
    const deposit = Number(rental.depositAmount ?? 0);
    if (data.refundAmount > deposit) throw new AppError('Nominal refund melebihi deposit yang ditahan.', 400);
    if (data.refundAmount > 0 && !data.refundProofImage) throw new AppError('Unggah bukti transfer refund terlebih dahulu.', 400);

    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        refundAmount: data.refundAmount,
        refundBank: data.refundBank ?? rental.refundBank,
        refundAccount: data.refundAccount ?? rental.refundAccount,
        refundHolder: data.refundHolder ?? rental.refundHolder,
        refundProofImage: data.refundProofImage ?? rental.refundProofImage,
        refundStatus: 'selesai',
        refundedAt: new Date(),
      },
    });

    await dispatchNotification({
      recipientType: 'user',
      recipientId: rental.order.userId,
      type: 'RENTAL_REFUNDED',
      title: 'Deposit Sewa Dikembalikan',
      message: `Deposit sewa ${rental.order.orderNumber} sebesar Rp ${data.refundAmount.toLocaleString('id-ID')} telah ditransfer.`,
      relatedOrderId: rental.orderId,
    });

    return updated;
  }
}
