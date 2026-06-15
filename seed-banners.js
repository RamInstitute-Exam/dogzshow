const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBanners() {
  await prisma.homepageBanner.deleteMany({});
  
  const banners = [
    {
      title: 'Luxury Doberman',
      desktopImage: '/images/luxury_doberman_hero_1781491210182.png',
      mobileImage: '/images/luxury_doberman_hero_1781491210182.png',
      status: 'ACTIVE',
      sortOrder: 1,
      targetBlank: false
    },
    {
      title: 'Luxury Golden Retriever',
      desktopImage: '/images/luxury_golden_retriever_hero_1781491300443.png',
      mobileImage: '/images/luxury_golden_retriever_hero_1781491300443.png',
      status: 'ACTIVE',
      sortOrder: 2,
      targetBlank: false
    },
    {
      title: 'Luxury Siberian Husky',
      desktopImage: '/images/luxury_husky_hero_1781491314270.png',
      mobileImage: '/images/luxury_husky_hero_1781491314270.png',
      status: 'ACTIVE',
      sortOrder: 3,
      targetBlank: false
    }
  ];

  for (const b of banners) {
    await prisma.homepageBanner.create({ data: b });
  }
  console.log('Banners seeded successfully');
}
seedBanners().catch(console.error).finally(() => prisma.$disconnect());
