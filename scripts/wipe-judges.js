const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipe() {
  try {
    // Delete all judges
    const result = await prisma.judge.deleteMany({});
    console.log(`Deleted ${result.count} judges.`);
  } catch (error) {
    console.error('Failed to wipe judges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

wipe();
