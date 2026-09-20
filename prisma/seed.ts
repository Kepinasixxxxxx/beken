import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  // Seed Owner Admin
  const ownerEmail = 'owner@vieguard.com';
  const existingOwner = await prisma.admin.findUnique({
    where: { email: ownerEmail },
  });

  if (!existingOwner) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const owner = await prisma.admin.create({
      data: {
        name: 'Super Owner Vieguard',
        email: ownerEmail,
        phone: '081234567890',
        passwordHash,
        role: 'owner',
      },
    });
    console.log(`Created Owner Admin: ${owner.email}`);
  }

  // Seed Store Profile
  const existingProfile = await prisma.storeProfile.findFirst();
  if (!existingProfile) {
    await prisma.storeProfile.create({
      data: {
        storeName: 'Vieguard Kostum & Drumband',
        description: 'Pusat pembuatan dan penyewaan kostum drumband, pawai, dan karnaval berkualitas tinggi.',
        address: 'Jl. Merdeka No. 45, Kota Malang, Jawa Timur',
        phone: '081234567890',
        email: 'info@vieguard.com',
        whatsappNumber: '6281234567890',
        socialMedia: '@vieguard_official',
        operationalHours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
      },
    });
    console.log('Created Store Profile.');
  }

  // Seed Default Categories
  const categories = [
    { name: 'Kostum Drumband', description: 'Seragam dan kostum anggota drumband & marching band' },
    { name: 'Kostum Pawai & Karnaval', description: 'Kostum kreasi seni untuk pawai, karnaval, dan acara daerah' },
    { name: 'Aksesoris Drumband', description: 'Topi, bulu, selempang, dan hiasan tambahan' },
  ];

  for (const cat of categories) {
    const exists = await prisma.category.findFirst({
      where: { name: cat.name },
    });
    if (!exists) {
      await prisma.category.create({ data: cat });
      console.log(`Created Category: ${cat.name}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
