import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

export class WebsiteTestimonialsService {
  static async getPublic() {
    return prisma.testimonial.findMany({
      include: {
        user: { select: { name: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(userId: bigint, data: { orderId: bigint; rating: number; comment?: string }) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId },
    });

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    if (order.status !== 'selesai') {
      throw new AppError('Testimoni hanya dapat dibuat untuk pesanan yang telah selesai.', 400);
    }

    const existingTestimonial = await prisma.testimonial.findFirst({
      where: { orderId: data.orderId },
    });

    if (existingTestimonial) {
      throw new AppError('Testimoni untuk pesanan ini sudah dibuat sebelumnya.', 409);
    }

    return prisma.testimonial.create({
      data: {
        userId,
        orderId: data.orderId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }
}
