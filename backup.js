const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function dump() {
  try {
    const users = await prisma.$queryRaw`SELECT * FROM User`;
    const dogs = await prisma.$queryRaw`SELECT * FROM DogProfile`;
    const images = await prisma.$queryRaw`SELECT * FROM Image`;
    
    fs.writeFileSync('backup.json', JSON.stringify({users, dogs, images}, null, 2));
    console.log('Backup successful');
  } catch (e) {
    console.error('Backup failed:', e);
  }
}

dump().finally(() => prisma.$disconnect());
