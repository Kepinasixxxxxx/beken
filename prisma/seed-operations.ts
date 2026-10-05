import { PrismaClient } from '@prisma/client';
import { dateOnly, day, gradientPng, stamp } from './seed-utils';

const prisma = new PrismaClient();

async function ensureUser(data: { name: string; email: string; phone: string; address: string }) {
  return prisma.user.upsert({ where: { email: data.email }, update: {}, create: data });
}

async function main() {
  console.log('Seeding operational demo data...');
  const admin = await prisma.admin.findUniqueOrThrow({ where: { email: 'owner@vieguard.com' } });
  const products = await prisma.product.findMany({ include: { variants: true } });
  const byName = (name: string) => products.find((p) => p.name === name)!;
  const drumband = byName('Kostum Drumband Gita Bahari');
  const karnaval = byName('Kostum Karnaval Nusantara');
  const reog = byName('Kostum Reog & Warok Ponorogo');
  const aksesoris = byName('Selempang & Topi Drumband');
  const variantId = (p: typeof drumband, size: string) => p.variants.find((v) => v.size === size)?.id;

  const accessoryNames = ['Topi Shako Bulu Putih', 'Tongkat Mayoret Emas', 'Epolet Emas', 'Mahkota Omprok Kuningan', 'Selendang Sampur Merah', 'Kipas Bambu Emas'];
  const accessories: Record<string, bigint> = {};
  for (const name of accessoryNames) {
    const existing = await prisma.accessory.findFirst({ where: { name } });
    accessories[name] = (existing ?? (await prisma.accessory.create({ data: { name, price: 0, stock: 40 } }))).id;
  }

  const productMeta: Array<[typeof drumband, string, string, Array<[string, number]>]> = [
    [drumband, 'KST-DRM-01', 'A', [['Topi Shako Bulu Putih', 1], ['Epolet Emas', 2], ['Tongkat Mayoret Emas', 1]]],
    [karnaval, 'KST-KRN-02', 'A', [['Mahkota Omprok Kuningan', 1], ['Selendang Sampur Merah', 1], ['Kipas Bambu Emas', 2]]],
    [reog, 'KST-ROG-03', 'B', []],
    [aksesoris, 'AKS-DRM-04', 'A', []],
  ];
  for (const [product, sku, grade, acc] of productMeta) {
    await prisma.product.update({ where: { id: product.id }, data: { sku, conditionGrade: grade } });
    for (const [name, qty] of acc) {
      await prisma.productAccessory.upsert({
        where: { productId_accessoryId: { productId: product.id, accessoryId: accessories[name] } },
        update: { quantityPerSet: qty },
        create: { productId: product.id, accessoryId: accessories[name], quantityPerSet: qty },
      });
    }
  }
  await prisma.productVariant.updateMany({ where: { productId: drumband.id, size: 'XL' }, data: { stockInService: 1, serviceNote: 'Jahit ulang kancing & ganti resleting' } });
  await prisma.productVariant.updateMany({ where: { productId: karnaval.id, size: 'M' }, data: { stockInService: 1, serviceNote: 'Laundry noda make-up' } });

  const smp = await ensureUser({ name: 'SMP Brawijaya Malang', email: 'smp.brawijaya@example.com', phone: '081234567890', address: 'Jl. Veteran No. 12, Lowokwaru, Kota Malang, Jawa Timur' });
  const sma = await ensureUser({ name: 'SMA Taruna Bangsa', email: 'sma.taruna@example.com', phone: '081355512345', address: 'Jl. Soekarno Hatta No. 45, Kota Malang, Jawa Timur' });
  const kepanjen = await ensureUser({ name: 'SMAN 1 Kepanjen', email: 'sman1.kepanjen@example.com', phone: '081299988877', address: 'Jl. Raya Kepanjen No. 3, Kabupaten Malang, Jawa Timur' });
  const budi = await prisma.user.findUniqueOrThrow({ where: { email: 'budi.santoso@example.com' } });
  const sanggar = await prisma.user.findFirstOrThrow({ where: { name: 'Ni Made Sukmawati' } });
  const dimas = await prisma.user.findFirstOrThrow({ where: { name: 'Dimas Kurniawan' } });

  const upsertOrder = async (orderNumber: string, create: () => Promise<{ id: bigint }>) => {
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    return existing ?? (await create());
  };

  const sizes: Array<[string, number]> = [['S', 10], ['M', 18], ['L', 6], ['XL', 2]];
  const customOrder = await upsertOrder(`VG-${stamp(0)}-8101`, () =>
    prisma.order.create({
      data: {
        userId: smp.id,
        orderNumber: `VG-${stamp(0)}-8101`,
        orderType: 'custom',
        requiresProduction: true,
        status: 'pending',
        totalPrice: 0,
        notes: 'Jahitan double tindas, kancing kuningan anti-karat, nama siswa dibordir di dada kiri.',
        createdAt: day(0, 9, 30),
        items: {
          create: sizes.map(([size, quantity]) => ({ itemType: 'product' as const, productId: drumband.id, productVariantId: variantId(drumband, size), size, quantity, unitPrice: 0, subtotal: 0 })),
        },
        customOrderDetail: {
          create: { jenisJenjang: 'Seragam Drumband SMP', designDescription: 'Jas mayoret & pasukan warna royal blue dengan lis emas dan epolet.' },
        },
      },
    }),
  );

  const firstNames = ['Ahmad Fadhil', 'Bunga Citra', 'Dimas Bagus', 'Eka Kurniawati', 'Farhan Maulana', 'Gita Maharani', 'Hendra Wicaksono', 'Intan Permata', 'Joko Susilo', 'Kirana Dewi', 'Lukman Hakim', 'Maya Sari'];
  const roles = ['Pasukan', 'Mayoret', 'Snare Drum', 'Bellyra', 'Bass Drum', 'Color Guard', 'Brass Section', 'Tenor Drum', 'Cymbal'];
  const entries: Array<{ orderId: bigint; studentName: string; gender: string; heightCm: number; size: string; role: string }> = [];
  let n = 0;
  for (const [size, count] of sizes) {
    for (let i = 0; i < count; i++, n++) {
      const female = n % 2 === 1;
      const base = { S: 152, M: 160, L: 168, XL: 175 }[size]!;
      entries.push({
        orderId: customOrder.id,
        studentName: `${firstNames[n % firstNames.length]} ${String.fromCharCode(65 + (n % 26))}.`,
        gender: female ? 'P' : 'L',
        heightCm: base + (n % 5),
        size,
        role: roles[n % roles.length],
      });
    }
  }
  await prisma.orderSizeEntry.deleteMany({ where: { orderId: customOrder.id } });
  await prisma.orderSizeEntry.createMany({ data: entries });

  const shipOrder = await upsertOrder(`VG-${stamp(-6)}-8102`, () =>
    prisma.order.create({
      data: {
        userId: sma.id,
        orderNumber: `VG-${stamp(-6)}-8102`,
        orderType: 'beli',
        status: 'siap_diambil',
        totalPrice: 2250000,
        dpAmount: 1125000,
        isLunas: true,
        deadlineDate: dateOnly(2),
        createdAt: day(-6, 10, 15),
        items: { create: [{ itemType: 'product', productId: aksesoris.id, productVariantId: variantId(aksesoris, 'All Size'), size: 'All Size', quantity: 30, unitPrice: 75000, subtotal: 2250000 }] },
        payments: {
          create: [
            { paymentType: 'dp', amount: 1125000, paymentMethod: 'BCA Transfer', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: day(-5, 11), createdAt: day(-5, 10, 40) },
            { paymentType: 'pelunasan', amount: 1125000, paymentMethod: 'BCA Transfer', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: day(-1, 9), createdAt: day(-1, 8, 20) },
          ],
        },
        statusHistory: { create: [{ progressPercentage: 100, statusLabel: 'Lolos QC & Dikemas', note: '30 set selempang & topi sudah dikemas per 10 pcs.', updatedBy: admin.id, createdAt: day(-1, 15) }] },
      },
    }),
  );

  await upsertOrder(`VG-${stamp(-3)}-8103`, () =>
    prisma.order.create({
      data: {
        userId: kepanjen.id,
        orderNumber: `VG-${stamp(-3)}-8103`,
        orderType: 'sewa',
        status: 'siap_diambil',
        totalPrice: 1800000,
        dpAmount: 900000,
        isLunas: true,
        notes: 'Parade HUT Kabupaten Malang',
        createdAt: day(-3, 14),
        items: {
          create: [
            { itemType: 'product', productId: karnaval.id, productVariantId: variantId(karnaval, 'M'), size: 'M', quantity: 6, unitPrice: 180000, subtotal: 1080000 },
            { itemType: 'product', productId: karnaval.id, productVariantId: variantId(karnaval, 'L'), size: 'L', quantity: 4, unitPrice: 180000, subtotal: 720000 },
          ],
        },
        payments: { create: [{ paymentType: 'pelunasan', amount: 1800000, paymentMethod: 'Mandiri Transfer', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: day(-2, 10), createdAt: day(-2, 9) }] },
        rental: {
          create: {
            pickupDate: dateOnly(0),
            returnDate: dateOnly(2),
            pickupTime: '09:00',
            returnTime: '18:00',
            depositAmount: 500000,
            refundBank: 'BRI',
            refundAccount: '0021-01-998877-50-1',
            refundHolder: 'Bendahara SMAN 1 Kepanjen',
            status: 'dipesan',
          },
        },
      },
    }),
  );

  await upsertOrder(`VG-${stamp(-4)}-8104`, () =>
    prisma.order.create({
      data: {
        userId: budi.id,
        orderNumber: `VG-${stamp(-4)}-8104`,
        orderType: 'sewa',
        status: 'siap_diambil',
        totalPrice: 1500000,
        isLunas: true,
        notes: 'Pentas Seni Dies Natalis',
        createdAt: day(-4, 11),
        items: { create: [{ itemType: 'product', productId: reog.id, productVariantId: variantId(reog, 'All Size'), size: 'All Size', quantity: 2, unitPrice: 250000, subtotal: 1500000 }] },
        payments: { create: [{ paymentType: 'pelunasan', amount: 1500000, paymentMethod: 'QRIS', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: day(-3, 9), createdAt: day(-3, 8) }] },
        rental: {
          create: {
            pickupDate: dateOnly(-2),
            returnDate: dateOnly(0),
            pickupTime: '10:00',
            returnTime: '18:00',
            depositAmount: 300000,
            refundBank: 'BCA',
            refundAccount: '4410-223-987',
            refundHolder: 'Budi Santoso',
            status: 'diambil',
            handoverAdminId: admin.id,
            handoverAt: day(-2, 10, 5),
            itemConditionBefore: 'Diserahkan lengkap: 2 set reog, dadak merak utuh, topeng tanpa retak.',
          },
        },
      },
    }),
  );

  const returned = await prisma.rental.findFirst({ where: { order: { userId: sanggar.id }, status: 'dikembalikan' } });
  if (returned) {
    await prisma.rental.update({
      where: { id: returned.id },
      data: {
        depositAmount: 500000,
        penaltyAmount: 75000,
        damageNote: returned.damageNote ?? 'Kostum Ukuran M: noda make-up di kerah (Rp 75.000)',
        itemConditionAfter: returned.itemConditionAfter ?? '11 stel baik & lengkap, 1 stel ada noda make-up.',
        refundStatus: returned.refundStatus === 'selesai' ? 'selesai' : 'menunggu',
        refundBank: 'BCA',
        refundAccount: '088-291-3819',
        refundHolder: 'Ni Made Sukmawati',
        pickupTime: '09:00',
        returnTime: '18:00',
      },
    });
  }

  const production = await prisma.order.findFirst({ where: { userId: dimas.id, orderType: 'custom' } });
  if (production) {
    const photos: Array<[string, string, [number, number, number], [number, number, number], string]> = [
      ['seed-workshop-1.png', 'Pola & potongan kain', [201, 161, 90], [106, 0, 18], 'workshop'],
      ['seed-workshop-2.png', 'Jahitan kerah jas', [44, 62, 107], [15, 26, 51], 'workshop'],
      ['seed-workshop-3.png', 'Bordir logo sekolah', [242, 199, 102], [122, 74, 32], 'workshop'],
      ['seed-qc-1.png', 'Cek kancing & lubang', [232, 210, 168], [142, 91, 42], 'qc'],
    ];
    await prisma.orderPhoto.deleteMany({ where: { orderId: production.id, imageUrl: { startsWith: '/uploads/orders/seed-' } } });
    for (const [file, title, from, to, category] of photos) {
      await prisma.orderPhoto.create({ data: { orderId: production.id, category, title, imageUrl: gradientPng(file, from, to), isPublic: category !== 'qc', uploadedBy: admin.id } });
    }
  }
  if (returned) {
    await prisma.orderPhoto.deleteMany({ where: { orderId: returned.orderId, imageUrl: { startsWith: '/uploads/orders/seed-' } } });
    await prisma.orderPhoto.create({ data: { orderId: returned.orderId, category: 'kerusakan', title: 'Noda make-up di kerah', imageUrl: gradientPng('seed-damage-1.png', [181, 59, 74], [58, 0, 8]), isPublic: false, uploadedBy: admin.id } });
  }

  const conversations: Array<[bigint, Array<['user' | 'admin', string, number]>]> = [
    [smp.id, [
      ['user', 'Selamat pagi admin, kami sudah mengirim data ukuran 36 siswa untuk seragam drumband.', -95],
      ['admin', 'Selamat pagi Pak, terima kasih. Data ukuran sudah kami terima dan sedang dicek.', -80],
      ['user', 'Baik. Kira-kira kapan penawaran harganya bisa kami terima?', -20],
      ['user', 'Kami perlu mengajukan anggaran ke komite minggu ini.', -18],
    ]],
    [dimas.id, [
      ['user', 'Halo, progres bordir logonya sudah sampai mana ya?', -300],
      ['admin', 'Sudah 50%, foto progres sudah kami unggah di halaman pesanan.', -280],
    ]],
    [sanggar.id, [
      ['admin', 'Terima kasih Bu Made, inspeksi pengembalian kostum sudah kami catat.', -1500],
      ['user', 'Baik, deposit dikembalikan ke rekening BCA yang sama ya.', -1400],
    ]],
  ];
  for (const [userId, messages] of conversations) {
    const conv = (await prisma.conversation.findFirst({ where: { userId } })) ?? (await prisma.conversation.create({ data: { userId, adminId: admin.id } }));
    const count = await prisma.message.count({ where: { conversationId: conv.id } });
    if (count > 0) continue;
    for (const [sender, text, minutes] of messages) {
      const createdAt = new Date(Date.now() + minutes * 60000);
      await prisma.message.create({
        data: { conversationId: conv.id, senderType: sender, senderId: sender === 'admin' ? admin.id : userId, messageText: text, isRead: sender === 'admin' || minutes < -60 ? true : false, createdAt },
      });
      await prisma.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: createdAt } });
    }
  }

  await prisma.admin.update({ where: { id: admin.id }, data: { passwordChangedAt: admin.passwordChangedAt ?? day(-18, 10) } });
  await prisma.refreshToken.updateMany({ where: { accountType: 'admin', accountId: admin.id, deviceName: null }, data: { deviceName: 'Perangkat lama (sebelum pencatatan)' } });

  console.log('Operational demo data ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
