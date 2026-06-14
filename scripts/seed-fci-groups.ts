import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GROUPS = [
  { groupNumber: 1, name: 'Sheepdogs & Cattle Dogs', slug: 'sheepdogs-cattle-dogs', cardImage: '/images/fci/group1.png', heroImage: '/images/fci/group1.png' },
  { groupNumber: 2, name: 'Pinschers & Schnauzers', slug: 'pinschers-schnauzers', cardImage: '/images/fci/group2.png', heroImage: '/images/fci/group2.png' },
  { groupNumber: 3, name: 'Terriers', slug: 'terriers', cardImage: '/images/fci/group3.png', heroImage: '/images/fci/group3.png' },
  { groupNumber: 4, name: 'Dachshunds', slug: 'dachshunds', cardImage: '/images/fci/group4.png', heroImage: '/images/fci/group4.png' },
  { groupNumber: 5, name: 'Spitz & Primitive Types', slug: 'spitz-primitive-types', cardImage: '/images/fci/group5.png', heroImage: '/images/fci/group5.png' },
  { groupNumber: 6, name: 'Scenthounds & Related', slug: 'scenthounds-related', cardImage: '/images/fci/group6.png', heroImage: '/images/fci/group6.png' },
  { groupNumber: 7, name: 'Pointing Dogs', slug: 'pointing-dogs', cardImage: '/images/fci/group7.png', heroImage: '/images/fci/group7.png' },
  { groupNumber: 8, name: 'Retrievers & Water Dogs', slug: 'retrievers-water-dogs', cardImage: '/images/fci/group8.png', heroImage: '/images/fci/group8.png' },
  { groupNumber: 9, name: 'Companion & Toy Dogs', slug: 'companion-toy-dogs', cardImage: '/images/fci/group9.png', heroImage: '/images/fci/group9.png' },
  { groupNumber: 10, name: 'Sighthounds', slug: 'sighthounds', cardImage: '/images/fci/group10.png', heroImage: '/images/fci/group10.png' },
];

async function main() {
  console.log('Seeding FCI Groups...');
  for (const group of GROUPS) {
    await prisma.fCIGroup.upsert({
      where: { groupNumber: group.groupNumber },
      update: {
        slug: group.slug,
        cardImage: group.cardImage,
        heroImage: group.heroImage,
        status: 'ACTIVE',
        displayOrder: group.groupNumber
      },
      create: {
        groupNumber: group.groupNumber,
        name: group.name,
        slug: group.slug,
        cardImage: group.cardImage,
        heroImage: group.heroImage,
        status: 'ACTIVE',
        displayOrder: group.groupNumber
      }
    });
  }
  console.log('FCI Groups seeded successfully!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
