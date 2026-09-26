import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function orderNumber(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `VG-${dateStr}-${suffix}`;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log('Seeding demo data...');

  const admin = await prisma.admin.findUniqueOrThrow({ where: { email: 'owner@vieguard.com' } });
  const categories = await prisma.category.findMany();
  const catDrumband = categories.find((c) => c.name === 'Kostum Drumband')!;
  const catPawai = categories.find((c) => c.name === 'Kostum Pawai & Karnaval')!;
  const catAksesoris = categories.find((c) => c.name === 'Aksesoris Drumband')!;

  // Customers
  const customerData = [
    { name: 'Budi Santoso', email: 'budi.santoso@example.com', phone: '081234000001', address: 'Jl. Ahmad Yani No. 12, Malang, Jawa Timur' },
    { name: 'Ni Made Sukmawati', email: 'sanggar.gayatri@example.com', phone: '081234000002', address: 'Jl. Diponegoro No. 8, Surabaya, Jawa Timur (Sanggar Tari Gayatri)' },
    { name: 'Rina Wijaya', email: 'rina.wijaya@example.com', phone: '081234000003', address: 'Jl. Sudirman No. 20, Malang, Jawa Timur' },
    { name: 'Ahmad Fauzan', email: 'ahmad.fauzan@example.com', phone: '081234000004', address: 'Jl. Veteran No. 5, Malang, Jawa Timur' },
    { name: 'Dimas Kurniawan', email: 'smk.telkom.malang@example.com', phone: '081234000005', address: 'Jl. Danau Ranau, Malang, Jawa Timur (SMK Telkom Malang)' },
  ];

  const customers: Record<string, any> = {};
  for (const c of customerData) {
    const user = await prisma.user.upsert({ where: { email: c.email }, update: {}, create: c });
    customers[c.email] = user;
  }

  // Products
  async function ensureProduct(data: {
    categoryId: bigint;
    name: string;
    description: string;
    basePriceBuy?: number;
    basePriceRent?: number;
    isCustomAvailable?: boolean;
    variants: { size: string; stockBuy: number; stockRent: number }[];
  }) {
    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    if (existing) return existing;
    return prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        basePriceBuy: data.basePriceBuy,
        basePriceRent: data.basePriceRent,
        isCustomAvailable: data.isCustomAvailable ?? false,
        isVisible: true,
        variants: { createMany: { data: data.variants } },
      },
      include: { variants: true },
    });
  }

  const prodDrumband = await ensureProduct({
    categoryId: catDrumband.id,
    name: 'Kostum Drumband Gita Bahari',
    description: 'Seragam drumband lengkap dengan aksesoris mayor & pasukan, bahan American Drill premium.',
    basePriceBuy: 850000,
    basePriceRent: 200000,
    isCustomAvailable: true,
    variants: [
      { size: 'S', stockBuy: 5, stockRent: 8 },
      { size: 'M', stockBuy: 8, stockRent: 12 },
      { size: 'L', stockBuy: 6, stockRent: 10 },
      { size: 'XL', stockBuy: 3, stockRent: 5 },
    ],
  });

  const prodKarnaval = await ensureProduct({
    categoryId: catPawai.id,
    name: 'Kostum Karnaval Nusantara',
    description: 'Kostum tari kreasi nusantara untuk pawai dan karnaval budaya.',
    basePriceRent: 180000,
    variants: [
      { size: 'S', stockBuy: 0, stockRent: 4 },
      { size: 'M', stockBuy: 0, stockRent: 6 },
      { size: 'L', stockBuy: 0, stockRent: 4 },
    ],
  });

  const prodReog = await ensureProduct({
    categoryId: catPawai.id,
    name: 'Kostum Reog & Warok Ponorogo',
    description: 'Kostum reog lengkap dengan dadak merak dan properti warok.',
    basePriceRent: 250000,
    variants: [{ size: 'All Size', stockBuy: 0, stockRent: 6 }],
  });

  const prodAksesoris = await ensureProduct({
    categoryId: catAksesoris.id,
    name: 'Selempang & Topi Drumband',
    description: 'Aksesoris tambahan selempang dan topi untuk pasukan drumband.',
    basePriceBuy: 75000,
    basePriceRent: 25000,
    variants: [{ size: 'All Size', stockBuy: 30, stockRent: 20 }],
  });

  const variantOf = (product: any, size: string) => product.variants.find((v: any) => v.size === size);

  // Helper to create an order with items
  async function createOrder(opts: {
    customerEmail: string;
    orderType: 'beli' | 'sewa' | 'custom';
    status: 'pending' | 'dikonfirmasi' | 'diproses' | 'siap_diambil' | 'selesai' | 'dibatalkan';
    requiresProduction?: boolean;
    items: { product: any; variant?: string; quantity: number; unitPrice: number }[];
    dpAmount?: number;
    isLunas?: boolean;
    deadlineDays?: number;
    notes?: string;
    createdDaysAgo?: number;
  }) {
    const totalPrice = opts.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const createdAt = daysFromNow(-(opts.createdDaysAgo ?? 0));
    const order = await prisma.order.create({
      data: {
        userId: customers[opts.customerEmail].id,
        orderNumber: orderNumber(-(opts.createdDaysAgo ?? 0)),
        orderType: opts.orderType,
        requiresProduction: opts.requiresProduction ?? false,
        status: opts.status,
        totalPrice,
        dpAmount: opts.dpAmount,
        isLunas: opts.isLunas ?? false,
        deadlineDate: opts.deadlineDays !== undefined ? daysFromNow(opts.deadlineDays) : undefined,
        notes: opts.notes,
        createdAt,
        items: {
          create: opts.items.map((i) => ({
            itemType: 'product' as const,
            productId: i.product.id,
            productVariantId: i.variant ? variantOf(i.product, i.variant)?.id : undefined,
            quantity: i.quantity,
            size: i.variant,
            unitPrice: i.unitPrice,
            subtotal: i.unitPrice * i.quantity,
          })),
        },
      },
    });
    return order;
  }

  // Order 1: pending, sewa
  const order1 = await createOrder({
    customerEmail: 'budi.santoso@example.com',
    orderType: 'sewa',
    status: 'pending',
    items: [{ product: prodDrumband, variant: 'M', quantity: 2, unitPrice: 200000 }],
    createdDaysAgo: 0,
  });

  // Order 2: dikonfirmasi, sewa, with rental + pending dp payment
  const order2 = await createOrder({
    customerEmail: 'sanggar.gayatri@example.com',
    orderType: 'sewa',
    status: 'dikonfirmasi',
    items: [{ product: prodKarnaval, variant: 'M', quantity: 12, unitPrice: 180000 }],
    dpAmount: 500000,
    createdDaysAgo: 1,
  });
  await prisma.rental.create({
    data: { orderId: order2.id, pickupDate: daysFromNow(0), returnDate: daysFromNow(3), status: 'dipesan' },
  });
  await prisma.payment.create({
    data: { orderId: order2.id, paymentType: 'dp', amount: 500000, paymentMethod: 'BCA Transfer', status: 'menunggu' },
  });

  // Order 3: diproses (rental sedang dipakai)
  const order3 = await createOrder({
    customerEmail: 'rina.wijaya@example.com',
    orderType: 'sewa',
    status: 'diproses',
    items: [{ product: prodReog, variant: 'All Size', quantity: 6, unitPrice: 250000 }],
    dpAmount: 750000,
    isLunas: true,
    createdDaysAgo: 3,
  });
  await prisma.rental.create({
    data: { orderId: order3.id, pickupDate: daysFromNow(-1), returnDate: daysFromNow(2), status: 'diambil' },
  });
  await prisma.payment.create({
    data: { orderId: order3.id, paymentType: 'dp', amount: 750000, paymentMethod: 'BCA Transfer', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: daysFromNow(-2) },
  });

  // Order 4: selesai, beli
  const order4 = await createOrder({
    customerEmail: 'ahmad.fauzan@example.com',
    orderType: 'beli',
    status: 'selesai',
    items: [{ product: prodAksesoris, variant: 'All Size', quantity: 5, unitPrice: 75000 }],
    isLunas: true,
    createdDaysAgo: 10,
  });
  await prisma.payment.create({
    data: { orderId: order4.id, paymentType: 'pelunasan', amount: 375000, paymentMethod: 'QRIS', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: daysFromNow(-9) },
  });

  // Order 5: custom, pending, requires production, with custom order detail
  const order5 = await createOrder({
    customerEmail: 'smk.telkom.malang@example.com',
    orderType: 'custom',
    status: 'pending',
    requiresProduction: true,
    items: [{ product: prodDrumband, variant: 'L', quantity: 24, unitPrice: 210000 }],
    deadlineDays: 21,
    notes: 'Pesanan custom seragam drumband untuk lomba tingkat provinsi.',
    createdDaysAgo: 0,
  });
  await prisma.customOrderDetail.create({
    data: {
      orderId: order5.id,
      designDescription: 'Seragam drumband dengan tambahan bordir logo sekolah di dada kiri dan list warna kuning emas.',
      jenisJenjang: 'SMK',
      consultationNote: 'Klien ingin konsultasi bahan dan warna sebelum produksi dimulai.',
    },
  });

  // Order 6: diproses (produksi custom), with progress history
  const order6 = await createOrder({
    customerEmail: 'budi.santoso@example.com',
    orderType: 'custom',
    status: 'diproses',
    requiresProduction: true,
    items: [{ product: prodDrumband, variant: 'M', quantity: 20, unitPrice: 210000 }],
    dpAmount: 2100000,
    deadlineDays: 10,
    createdDaysAgo: 7,
  });
  await prisma.payment.create({
    data: { orderId: order6.id, paymentType: 'dp', amount: 2100000, paymentMethod: 'BCA Transfer', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: daysFromNow(-6) },
  });
  await prisma.orderStatusHistory.create({
    data: { orderId: order6.id, progressPercentage: 30, statusLabel: 'Pola & Pemotongan Kain (Cutting)', note: 'Pemotongan pola untuk 20 stel selesai.', updatedBy: admin.id, createdAt: daysFromNow(-4) },
  });
  await prisma.orderStatusHistory.create({
    data: { orderId: order6.id, progressPercentage: 65, statusLabel: 'Proses Jahit & Assembling', note: 'Proses jahit sedang berjalan, 13 dari 20 stel selesai.', updatedBy: admin.id, createdAt: daysFromNow(-1) },
  });

  // Order 7: siap_diambil, sewa, lunas
  const order7 = await createOrder({
    customerEmail: 'rina.wijaya@example.com',
    orderType: 'sewa',
    status: 'siap_diambil',
    items: [{ product: prodKarnaval, variant: 'S', quantity: 4, unitPrice: 180000 }],
    isLunas: true,
    createdDaysAgo: 2,
  });
  await prisma.rental.create({
    data: { orderId: order7.id, pickupDate: daysFromNow(1), returnDate: daysFromNow(4), status: 'dipesan' },
  });
  await prisma.payment.create({
    data: { orderId: order7.id, paymentType: 'pelunasan', amount: 720000, paymentMethod: 'QRIS', status: 'terverifikasi', verifiedBy: admin.id, verifiedAt: daysFromNow(-1) },
  });

  // Admin notifications
  await prisma.notification.create({
    data: {
      recipientType: 'admin',
      recipientId: admin.id,
      type: 'NEW_ORDER',
      title: 'Pesanan Baru Masuk',
      message: `Pesanan baru ${order1.orderNumber} dari Budi Santoso menunggu konfirmasi.`,
      relatedOrderId: order1.id,
      isRead: false,
    },
  });
  await prisma.notification.create({
    data: {
      recipientType: 'admin',
      recipientId: admin.id,
      type: 'PAYMENT_SUBMITTED',
      title: 'Bukti Pembayaran Baru',
      message: `Ni Made Sukmawati mengirim bukti transfer DP untuk pesanan ${order2.orderNumber}.`,
      relatedOrderId: order2.id,
      isRead: false,
    },
  });
  await prisma.notification.create({
    data: {
      recipientType: 'admin',
      recipientId: admin.id,
      type: 'ORDER_STATUS_UPDATE',
      title: 'Progres Produksi Diperbarui',
      message: `Progres produksi ${order6.orderNumber} mencapai 65%.`,
      relatedOrderId: order6.id,
      isRead: true,
    },
  });

  console.log('Demo data seeded successfully!');
  console.log(`Created ${customerData.length} customers, 4 products, 7 orders.`);
}

main()
  .catch((e) => {
    console.error('Demo seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
