import { Prisma, PrismaClient } from '@prisma/client';
import { dateOnly, day, gradientPng } from './seed-utils';

const prisma = new PrismaClient();

type Notice = { type: string; title: string; message: string };

async function main() {
  console.log('Seeding orders awaiting admin verification...');
  const admins = await prisma.admin.findMany({ select: { id: true } });
  const owner = await prisma.admin.findUniqueOrThrow({ where: { email: 'owner@vieguard.com' } });
  const products = await prisma.product.findMany({ include: { variants: true } });
  const product = (name: string) => products.find((p) => p.name === name)!;
  const variantId = (name: string, size: string) => product(name).variants.find((v) => v.size === size)?.id;
  const user = (email: string) => prisma.user.findUniqueOrThrow({ where: { email } });

  const [rina, taruna, ahmad, dimas] = await Promise.all([
    user('rina.wijaya@example.com'),
    user('sma.taruna@example.com'),
    user('ahmad.fauzan@example.com'),
    user('smk.telkom.malang@example.com'),
  ]);
  const drumband = 'Kostum Drumband Gita Bahari';
  const karnaval = 'Kostum Karnaval Nusantara';
  const aksesoris = 'Selempang & Topi Drumband';

  const seedOrder = async (orderNumber: string, data: Omit<Prisma.OrderUncheckedCreateInput, 'orderNumber'>, notice: Notice) => {
    if (await prisma.order.findUnique({ where: { orderNumber } })) return console.log(`- ${orderNumber} sudah ada`);
    const order = await prisma.order.create({ data: { ...data, orderNumber } });
    await prisma.notification.createMany({
      data: admins.map((a) => ({ recipientType: 'admin' as const, recipientId: a.id, type: notice.type, title: notice.title, message: notice.message, relatedOrderId: order.id, createdAt: data.updatedAt ?? new Date() })),
    });
    console.log(`+ ${orderNumber}`);
  };

  await seedOrder(
    'VG-20261005-8201',
    {
      userId: rina.id,
      orderType: 'beli',
      status: 'dikonfirmasi',
      totalPrice: 1700000,
      dpAmount: 850000,
      deadlineDate: dateOnly(10),
      notes: 'Untuk lomba marching band tingkat provinsi.',
      createdAt: day(-1, 13, 10),
      updatedAt: day(0, 8, 42),
      items: { create: [{ itemType: 'product', productId: product(drumband).id, productVariantId: variantId(drumband, 'M'), size: 'M', quantity: 2, unitPrice: 850000, subtotal: 1700000 }] },
      payments: {
        create: [{ paymentType: 'dp', amount: 850000, paymentMethod: 'BCA Transfer', proofImage: gradientPng('seed-proof-8201.png', [0, 84, 166], [210, 228, 245], 'payments'), createdAt: day(0, 8, 42) }],
      },
    },
    { type: 'PAYMENT_PROOF_UPLOADED', title: 'Bukti Pembayaran Diunggah', message: 'Bukti transfer (dp) untuk pesanan VG-20261005-8201 diunggah oleh pelanggan.' },
  );

  await seedOrder(
    'VG-20261005-8202',
    {
      userId: taruna.id,
      orderType: 'sewa',
      status: 'dikonfirmasi',
      totalPrice: 1440000,
      notes: 'Karnaval Agustusan kecamatan, 8 siswa.',
      createdAt: day(-2, 10, 5),
      updatedAt: day(0, 9, 15),
      items: { create: [{ itemType: 'product', productId: product(karnaval).id, productVariantId: variantId(karnaval, 'L'), size: 'L', quantity: 8, unitPrice: 180000, subtotal: 1440000 }] },
      payments: {
        create: [{ paymentType: 'pelunasan', amount: 1440000, paymentMethod: 'QRIS', proofImage: gradientPng('seed-proof-8202.png', [122, 0, 21], [242, 199, 102], 'payments'), createdAt: day(0, 9, 15) }],
      },
      rental: {
        create: {
          pickupDate: dateOnly(4),
          returnDate: dateOnly(6),
          pickupTime: '08:00',
          returnTime: '17:00',
          depositAmount: 400000,
          refundBank: 'BNI',
          refundAccount: '0812-334-455',
          refundHolder: 'Bendahara SMA Taruna Bangsa',
          status: 'dipesan',
        },
      },
    },
    { type: 'PAYMENT_PROOF_UPLOADED', title: 'Bukti Pembayaran Diunggah', message: 'Bukti transfer (pelunasan) untuk pesanan VG-20261005-8202 diunggah oleh pelanggan.' },
  );

  await seedOrder(
    'VG-20261005-8203',
    {
      userId: ahmad.id,
      orderType: 'custom',
      requiresProduction: true,
      status: 'diproses',
      totalPrice: 3600000,
      dpAmount: 1800000,
      deadlineDate: dateOnly(14),
      notes: 'Seragam paduan suara, kerah shanghai, warna hijau botol.',
      createdAt: day(-9, 11),
      updatedAt: day(0, 10, 3),
      items: { create: [{ itemType: 'product', productId: product(drumband).id, productVariantId: variantId(drumband, 'L'), size: 'L', quantity: 6, unitPrice: 600000, subtotal: 3600000 }] },
      customOrderDetail: { create: { jenisJenjang: 'Seragam Paduan Suara SMA', designDescription: 'Beskap modern hijau botol dengan list emas di kerah dan manset.' } },
      payments: {
        create: [
          { paymentType: 'dp', amount: 1800000, paymentMethod: 'Mandiri Transfer', status: 'terverifikasi', verifiedBy: owner.id, verifiedAt: day(-8, 9), createdAt: day(-8, 8, 30) },
          { paymentType: 'pelunasan', amount: 1800000, paymentMethod: 'Mandiri Transfer', proofImage: gradientPng('seed-proof-8203.png', [0, 61, 121], [255, 196, 0], 'payments'), createdAt: day(0, 10, 3) },
        ],
      },
      statusHistory: { create: [{ progressPercentage: 70, statusLabel: 'Proses Jahit', note: 'Badan beskap selesai, tinggal pasang list emas.', updatedBy: owner.id, createdAt: day(-2, 15) }] },
    },
    { type: 'PAYMENT_PROOF_UPLOADED', title: 'Bukti Pembayaran Diunggah', message: 'Bukti transfer (pelunasan) untuk pesanan VG-20261005-8203 diunggah oleh pelanggan.' },
  );

  await seedOrder(
    'VG-20261005-8204',
    {
      userId: dimas.id,
      orderType: 'beli',
      status: 'pending',
      totalPrice: 1500000,
      notes: 'Mohon dikirim ke sekolah, bukan diambil.',
      createdAt: day(0, 7, 55),
      updatedAt: day(0, 7, 55),
      items: { create: [{ itemType: 'product', productId: product(aksesoris).id, productVariantId: variantId(aksesoris, 'All Size'), size: 'All Size', quantity: 20, unitPrice: 75000, subtotal: 1500000 }] },
    },
    { type: 'ORDER_NEW', title: 'Pesanan Baru Diterima', message: 'Pesanan VG-20261005-8204 (beli) telah dibuat oleh pelanggan.' },
  );

  const awaitingDp = await prisma.order.findUnique({ where: { orderNumber: 'VG-20261005-8303' }, include: { payments: true } });
  if (awaitingDp && awaitingDp.status === 'dikonfirmasi' && !awaitingDp.payments.some((p) => p.paymentType === 'dp')) {
    await prisma.payment.create({
      data: { orderId: awaitingDp.id, paymentType: 'dp', amount: awaitingDp.dpAmount ?? 0, paymentMethod: 'BRI Transfer', proofImage: gradientPng('seed-proof-8303.png', [0, 82, 147], [235, 220, 198], 'payments') },
    });
    await prisma.notification.createMany({
      data: admins.map((a) => ({ recipientType: 'admin' as const, recipientId: a.id, type: 'PAYMENT_PROOF_UPLOADED', title: 'Bukti Pembayaran Diunggah', message: 'Bukti transfer (dp) untuk pesanan VG-20261005-8303 diunggah oleh pelanggan.', relatedOrderId: awaitingDp.id })),
    });
    console.log('+ DP menunggu untuk VG-20261005-8303');
  }

  console.log('Selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
