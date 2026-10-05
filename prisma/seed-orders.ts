import { Prisma, PrismaClient } from '@prisma/client';
import { dateOnly, day } from './seed-utils';

const prisma = new PrismaClient();

const DRUMBAND = 'Kostum Drumband Gita Bahari';
const KARNAVAL = 'Kostum Karnaval Nusantara';
const REOG = 'Kostum Reog & Warok Ponorogo';
const AKSESORIS = 'Selempang & Topi Drumband';

async function main() {
  console.log('Seeding custom & standard orders...');
  const owner = await prisma.admin.findUniqueOrThrow({ where: { email: 'owner@vieguard.com' } });
  const products = await prisma.product.findMany({ include: { variants: true } });

  const item = (name: string, size: string, quantity: number, unitPrice: number) => {
    const product = products.find((p) => p.name === name)!;
    return { itemType: 'product' as const, productId: product.id, productVariantId: product.variants.find((v) => v.size === size)?.id, size, quantity, unitPrice, subtotal: unitPrice * quantity };
  };
  const total = (items: ReturnType<typeof item>[]) => items.reduce((s, i) => s + i.subtotal, 0);
  const paid = (paymentType: 'dp' | 'pelunasan', amount: number, paymentMethod: string, offset: number) => ({
    paymentType,
    amount,
    paymentMethod,
    status: 'terverifikasi' as const,
    verifiedBy: owner.id,
    verifiedAt: day(offset, 11),
    createdAt: day(offset, 9, 30),
  });
  const history = (progressPercentage: number, statusLabel: string, note: string, offset: number, hour = 15) => ({ progressPercentage, statusLabel, note, updatedBy: owner.id, createdAt: day(offset, hour) });

  const users = {
    sman3: await ensureUser('SMAN 3 Malang', 'sman3.malang@example.com', '081233344455', 'Jl. Sultan Agung Utara No. 7, Klojen, Kota Malang'),
    sdMuh: await ensureUser('SD Muhammadiyah 1 Batu', 'sdmuh1.batu@example.com', '081377788899', 'Jl. Diponegoro No. 21, Kota Batu, Jawa Timur'),
    smkn2: await ensureUser('SMK Negeri 2 Malang', 'smkn2.malang@example.com', '081255566677', 'Jl. Veteran No. 17, Lowokwaru, Kota Malang'),
    rina: await prisma.user.findUniqueOrThrow({ where: { email: 'rina.wijaya@example.com' } }),
    taruna: await prisma.user.findUniqueOrThrow({ where: { email: 'sma.taruna@example.com' } }),
    budi: await prisma.user.findUniqueOrThrow({ where: { email: 'budi.santoso@example.com' } }),
    kepanjen: await prisma.user.findUniqueOrThrow({ where: { email: 'sman1.kepanjen@example.com' } }),
    sanggar: await prisma.user.findUniqueOrThrow({ where: { email: 'sanggar.gayatri@example.com' } }),
    ahmad: await prisma.user.findUniqueOrThrow({ where: { email: 'ahmad.fauzan@example.com' } }),
    dimas: await prisma.user.findUniqueOrThrow({ where: { email: 'smk.telkom.malang@example.com' } }),
  };

  const seed = async (orderNumber: string, data: Omit<Prisma.OrderUncheckedCreateInput, 'orderNumber'>, sizes?: Array<[string, number]>) => {
    if (await prisma.order.findUnique({ where: { orderNumber } })) return console.log(`- ${orderNumber} sudah ada`);
    const order = await prisma.order.create({ data: { ...data, orderNumber } });
    if (sizes) await prisma.orderSizeEntry.createMany({ data: studentSizes(order.id, sizes) });
    console.log(`+ ${orderNumber} ${data.orderType} ${data.status}`);
  };

  const c1 = [item(DRUMBAND, 'S', 4, 0), item(DRUMBAND, 'M', 6, 0), item(DRUMBAND, 'L', 2, 0)];
  await seed('VG-20261005-8301', {
    userId: users.sman3.id, orderType: 'custom', requiresProduction: true, status: 'pending', totalPrice: 0,
    notes: 'Warna merah marun, list emas di dada, topi pet hitam.', createdAt: day(0, 6, 40),
    items: { create: c1 },
    customOrderDetail: { create: { jenisJenjang: 'Seragam Drumband SMA', designDescription: 'Jas mayoret marun dengan tali kur emas dan epolet berumbai.' } },
  }, [['S', 4], ['M', 6], ['L', 2]]);

  const c2 = [item(DRUMBAND, 'S', 12, 240000)];
  await seed('VG-20261005-8302', {
    userId: users.sdMuh.id, orderType: 'custom', requiresProduction: true, status: 'pending', totalPrice: total(c2), dpAmount: total(c2) / 2, deadlineDate: dateOnly(21),
    notes: 'Untuk pawai Milad sekolah.', createdAt: day(-3, 10),
    items: { create: c2 },
    customOrderDetail: { create: { jenisJenjang: 'Seragam Pawai SD', designDescription: 'Rompi hijau tua dengan logo sekolah bordir di punggung.', consultationNote: 'Harga sudah termasuk bordir logo 2 sisi.' } },
    statusHistory: { create: [history(0, 'Penawaran Harga Dikirim', 'Harga sudah termasuk bordir logo 2 sisi.', -2, 10)] },
  });

  const c3 = [item(DRUMBAND, 'M', 10, 450000)];
  await seed('VG-20261005-8303', {
    userId: users.smkn2.id, orderType: 'custom', requiresProduction: true, status: 'dikonfirmasi', totalPrice: total(c3), dpAmount: total(c3) / 2, deadlineDate: dateOnly(25),
    notes: 'Seragam color guard, bahan satin.', createdAt: day(-6, 9),
    items: { create: c3 },
    customOrderDetail: { create: { jenisJenjang: 'Seragam Color Guard SMK', designDescription: 'Atasan satin biru elektrik, rok lipit, aksen payet perak.' } },
    statusHistory: { create: [history(0, 'Penawaran Harga Dikirim', 'Bahan satin import, payet jahit tangan.', -5), history(0, 'Pesanan Dikonfirmasi Admin', 'Menunggu pembayaran DP.', -4, 9)] },
  });

  const c4 = [item(DRUMBAND, 'S', 6, 380000), item(DRUMBAND, 'M', 8, 380000)];
  await seed('VG-20261005-8304', {
    userId: users.rina.id, orderType: 'custom', requiresProduction: true, status: 'diproses', totalPrice: total(c4), dpAmount: total(c4) / 2, deadlineDate: dateOnly(12),
    notes: 'Kostum tari kreasi untuk festival budaya.', createdAt: day(-12, 13),
    items: { create: c4 },
    customOrderDetail: { create: { jenisJenjang: 'Kostum Tari Kreasi', designDescription: 'Kebaya modern merah dengan selendang emas dan hiasan kepala.' } },
    payments: { create: [paid('dp', total(c4) / 2, 'BCA Transfer', -9)] },
    statusHistory: { create: [history(0, 'Pesanan Dikonfirmasi Admin', 'DP diterima.', -9, 12), history(30, 'Pemotongan Kain', 'Pola sudah fix, kain dipotong untuk 14 stel.', -4)] },
  }, [['S', 6], ['M', 8]]);

  const c5 = [item(DRUMBAND, 'L', 16, 520000)];
  await seed('VG-20261005-8305', {
    userId: users.taruna.id, orderType: 'custom', requiresProduction: true, status: 'diproses', totalPrice: total(c5), dpAmount: total(c5) / 2, deadlineDate: dateOnly(4),
    notes: 'Seragam pasukan inti marching band.', createdAt: day(-24, 10),
    items: { create: c5 },
    customOrderDetail: { create: { jenisJenjang: 'Seragam Marching Band SMA', designDescription: 'Jas navy dengan kancing kuningan dan sabuk putih.' } },
    payments: { create: [paid('dp', total(c5) / 2, 'Mandiri Transfer', -22)] },
    statusHistory: { create: [history(30, 'Pemotongan Kain', 'Kain navy dipotong.', -18), history(65, 'Proses Jahit', 'Badan jas selesai dijahit.', -9), history(90, 'Quality Control', 'Cek kancing dan jahitan, 2 stel perlu rapikan obras.', -1)] },
  });

  const c6 = [item(DRUMBAND, 'M', 5, 600000)];
  await seed('VG-20261005-8306', {
    userId: users.budi.id, orderType: 'custom', requiresProduction: true, status: 'siap_diambil', totalPrice: total(c6), dpAmount: total(c6) / 2, isLunas: true, deadlineDate: dateOnly(1),
    notes: 'Kostum mayoret untuk lomba.', createdAt: day(-30, 9),
    items: { create: c6 },
    customOrderDetail: { create: { jenisJenjang: 'Kostum Mayoret', designDescription: 'Jas putih gading dengan mantel merah dan topi shako bulu.' } },
    payments: { create: [paid('dp', total(c6) / 2, 'BRI Transfer', -28), paid('pelunasan', total(c6) / 2, 'BRI Transfer', -2)] },
    statusHistory: { create: [history(40, 'Proses Jahit', 'Mantel dan jas dijahit.', -15), history(100, 'Siap Diambil Pelanggan', 'Sudah lolos QC dan dikemas.', -1)] },
  });

  const c7 = [item(DRUMBAND, 'L', 20, 410000)];
  await seed('VG-20261005-8307', {
    userId: users.kepanjen.id, orderType: 'custom', requiresProduction: true, status: 'selesai', totalPrice: total(c7), dpAmount: total(c7) / 2, isLunas: true,
    notes: 'Seragam paskibra sekolah.', createdAt: day(-45, 10),
    items: { create: c7 },
    customOrderDetail: { create: { jenisJenjang: 'Seragam Paskibra', designDescription: 'PDU putih dengan tanda pundak merah putih.' } },
    payments: { create: [paid('dp', total(c7) / 2, 'BNI Transfer', -43), paid('pelunasan', total(c7) / 2, 'BNI Transfer', -16)] },
    statusHistory: { create: [history(100, 'Siap Diambil Pelanggan', 'Lolos QC.', -15), history(100, 'Status diubah ke selesai', 'Sudah diambil pihak sekolah.', -14)] },
  });

  const c8 = [item(DRUMBAND, 'M', 8, 0)];
  await seed('VG-20261005-8308', {
    userId: users.sanggar.id, orderType: 'custom', requiresProduction: true, status: 'dibatalkan', totalPrice: 0,
    notes: 'Kostum sendratari Ramayana.', createdAt: day(-20, 14),
    items: { create: c8 },
    customOrderDetail: { create: { jenisJenjang: 'Kostum Sendratari', designDescription: 'Kostum Rama & Shinta dengan aksen emas.' } },
    statusHistory: { create: [history(0, 'Status diubah ke dibatalkan', 'Pelanggan membatalkan karena jadwal pentas diundur.', -18)] },
  });

  const s1 = [item(AKSESORIS, 'All Size', 3, 75000)];
  await seed('VG-20261005-8311', {
    userId: users.ahmad.id, orderType: 'beli', status: 'pending', totalPrice: total(s1), createdAt: day(0, 8, 20),
    items: { create: s1 },
  });

  const s2 = [item(DRUMBAND, 'S', 4, 850000)];
  await seed('VG-20261005-8312', {
    userId: users.sdMuh.id, orderType: 'beli', status: 'dikonfirmasi', totalPrice: total(s2), dpAmount: total(s2) / 2, deadlineDate: dateOnly(7),
    notes: 'Untuk ekstrakurikuler drumband.', createdAt: day(-2, 11),
    items: { create: s2 },
    statusHistory: { create: [history(0, 'Pesanan Dikonfirmasi Admin', 'Menunggu pembayaran DP.', -1, 9)] },
  });

  const s3 = [item(AKSESORIS, 'All Size', 10, 75000)];
  await seed('VG-20261005-8313', {
    userId: users.rina.id, orderType: 'beli', status: 'siap_diambil', totalPrice: total(s3), isLunas: true, createdAt: day(-4, 15),
    items: { create: s3 },
    payments: { create: [paid('pelunasan', total(s3), 'QRIS', -3)] },
  });

  const s4 = [item(DRUMBAND, 'L', 2, 850000), item(AKSESORIS, 'All Size', 2, 75000)];
  await seed('VG-20261005-8314', {
    userId: users.smkn2.id, orderType: 'beli', status: 'siap_diambil', totalPrice: total(s4), isLunas: true, createdAt: day(-7, 10),
    courier: 'JNE REG', trackingNumber: 'JNE0123456789', shippingCost: 45000, shippedAt: day(-1, 14), etaDate: dateOnly(1),
    items: { create: s4 },
    payments: { create: [paid('pelunasan', total(s4), 'BCA Transfer', -6)] },
    statusHistory: { create: [history(100, 'Dikirim', 'Dikirim via JNE REG, resi JNE0123456789.', -1, 14)] },
  });

  const s5 = [item(DRUMBAND, 'XL', 1, 850000)];
  await seed('VG-20261005-8315', {
    userId: users.dimas.id, orderType: 'beli', status: 'selesai', totalPrice: total(s5), isLunas: true, createdAt: day(-15, 9),
    items: { create: s5 },
    payments: { create: [paid('pelunasan', total(s5), 'BRI Transfer', -14)] },
    statusHistory: { create: [history(100, 'Status diubah ke selesai', 'Barang sudah diterima pelanggan.', -11)] },
  });

  const s6 = [item(AKSESORIS, 'All Size', 5, 75000)];
  await seed('VG-20261005-8316', {
    userId: users.budi.id, orderType: 'beli', status: 'dibatalkan', totalPrice: total(s6), createdAt: day(-10, 16),
    items: { create: s6 },
    statusHistory: { create: [history(0, 'Status diubah ke dibatalkan', 'Tidak ada pembayaran hingga batas waktu.', -8)] },
  });

  const r1 = [item(KARNAVAL, 'S', 6, 180000), item(KARNAVAL, 'M', 4, 180000)];
  await seed('VG-20261005-8321', {
    userId: users.sman3.id, orderType: 'sewa', status: 'siap_diambil', totalPrice: total(r1), isLunas: true, notes: 'Karnaval budaya kota.', createdAt: day(-3, 9),
    items: { create: r1 },
    payments: { create: [paid('pelunasan', total(r1), 'Mandiri Transfer', -2)] },
    rental: { create: { pickupDate: dateOnly(2), returnDate: dateOnly(4), pickupTime: '07:30', returnTime: '17:00', depositAmount: 500000, status: 'dipesan' } },
  });

  const r2 = [item(REOG, 'All Size', 3, 250000)];
  await seed('VG-20261005-8322', {
    userId: users.sdMuh.id, orderType: 'sewa', status: 'siap_diambil', totalPrice: total(r2), isLunas: true, notes: 'Pentas seni akhir semester.', createdAt: day(-8, 10),
    items: { create: r2 },
    payments: { create: [paid('pelunasan', total(r2), 'QRIS', -7)] },
    rental: {
      create: {
        pickupDate: dateOnly(-4), returnDate: dateOnly(-1), pickupTime: '08:00', returnTime: '16:00', depositAmount: 300000, status: 'terlambat',
        handoverAdminId: owner.id, handoverAt: day(-4, 8, 10), itemConditionBefore: 'Diserahkan lengkap: 3 set reog dalam kondisi baik.',
      },
    },
  });

  const r3 = [item(DRUMBAND, 'M', 12, 200000)];
  await seed('VG-20261005-8323', {
    userId: users.ahmad.id, orderType: 'sewa', status: 'selesai', totalPrice: total(r3), isLunas: true, notes: 'Lomba drumband antar sekolah.', createdAt: day(-18, 9),
    items: { create: r3 },
    payments: { create: [paid('pelunasan', total(r3), 'BCA Transfer', -17)] },
    rental: {
      create: {
        pickupDate: dateOnly(-12), returnDate: dateOnly(-10), actualReturnDate: dateOnly(-10), pickupTime: '08:00', returnTime: '17:00', depositAmount: 400000, refundAmount: 400000, refundStatus: 'selesai', refundedAt: day(-9, 10),
        status: 'dikembalikan', handoverAdminId: owner.id, handoverAt: day(-12, 8, 15),
        itemConditionBefore: 'Diserahkan lengkap: 12 stel jas drumband ukuran M.', itemConditionAfter: '12 stel baik & lengkap.',
      },
    },
  });

  console.log('Selesai.');
}

async function ensureUser(name: string, email: string, phone: string, address: string) {
  return prisma.user.upsert({ where: { email }, update: {}, create: { name, email, phone, address } });
}

function studentSizes(orderId: bigint, sizes: Array<[string, number]>) {
  const names = ['Aditya', 'Bella', 'Cahyo', 'Dewi', 'Erlangga', 'Fitri', 'Galih', 'Hana', 'Ilham', 'Jasmine', 'Kevin', 'Laras', 'Malik', 'Nadia'];
  const roles = ['Pasukan', 'Mayoret', 'Snare Drum', 'Bellyra', 'Bass Drum', 'Color Guard'];
  const base: Record<string, number> = { S: 150, M: 158, L: 166, XL: 174 };
  let n = 0;
  return sizes.flatMap(([size, count]) =>
    Array.from({ length: count }, () => {
      const i = n++;
      return { orderId, studentName: `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}.`, gender: i % 2 ? 'P' : 'L', heightCm: (base[size] ?? 160) + (i % 5), size, role: roles[i % roles.length] };
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
