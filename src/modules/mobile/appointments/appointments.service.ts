import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

const TYPES = ['fitting', 'ambil', 'kembali', 'konsultasi'];

export class MobileAppointmentsService {
  static async list(query: { date?: string; startDate?: string; endDate?: string }) {
    let start: Date;
    let end: Date;
    if (query.date) {
      start = new Date(`${query.date}T00:00:00`);
      end = new Date(`${query.date}T23:59:59`);
    } else {
      start = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 31 * 86400000);
      end = query.endDate ? new Date(query.endDate) : new Date(Date.now() + 62 * 86400000);
    }
    return prisma.appointment.findMany({
      where: { startAt: { gte: start, lte: end } },
      include: { order: { select: { id: true, orderNumber: true, orderType: true } } },
      orderBy: { startAt: 'asc' },
    });
  }

  static async create(
    adminId: bigint,
    data: { type: string; orderId?: string | number | null; customerName: string; startAt: string; durationMinutes?: number; room?: string; staffName?: string; note?: string },
  ) {
    if (!TYPES.includes(data.type)) throw new AppError('Jenis jadwal tidak dikenal.', 400);
    if (!data.customerName?.trim()) throw new AppError('Nama pelanggan wajib diisi.', 400);
    const startAt = new Date(data.startAt);
    if (Number.isNaN(startAt.getTime())) throw new AppError('Tanggal & jam jadwal tidak valid.', 400);
    const duration = Math.min(480, Math.max(15, Math.round(Number(data.durationMinutes) || 60)));
    const endAt = new Date(startAt.getTime() + duration * 60000);
    const room = data.room?.trim() || null;

    const dayStart = new Date(startAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const sameDay = await prisma.appointment.findMany({ where: { startAt: { gte: dayStart, lt: dayEnd } } });
    const clash = sameDay.find((a) => {
      const aEnd = new Date(a.startAt.getTime() + a.durationMinutes * 60000);
      const overlap = a.startAt < endAt && aEnd > startAt;
      const sameRoom = !room || !a.room || a.room === room;
      return overlap && sameRoom;
    });
    if (clash) {
      const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const clashEnd = new Date(clash.startAt.getTime() + clash.durationMinutes * 60000);
      throw new AppError(`Bentrok dengan jadwal ${clash.customerName} pukul ${hhmm(clash.startAt)}–${hhmm(clashEnd)}${clash.room ? ` di ${clash.room}` : ''}.`, 409);
    }

    return prisma.appointment.create({
      data: {
        type: data.type,
        orderId: data.orderId ? BigInt(data.orderId) : null,
        customerName: data.customerName.trim().slice(0, 120),
        startAt,
        durationMinutes: duration,
        room,
        staffName: data.staffName?.trim() || null,
        note: data.note?.trim() || null,
        createdBy: adminId,
      },
      include: { order: { select: { id: true, orderNumber: true, orderType: true } } },
    });
  }

  static async remove(id: bigint) {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new AppError('Jadwal tidak ditemukan.', 404);
    await prisma.appointment.delete({ where: { id } });
  }
}
