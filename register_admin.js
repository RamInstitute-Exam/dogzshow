const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Assuming bcrypt is installed

const prisma = new PrismaClient({});

async function run() {
  try {
    const email = 'admin@gmail.com';
    const password = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', password },
      create: {
        email,
        password,
        role: 'ADMIN'
      }
    });
    console.log('Successfully created/updated admin@gmail.com with ADMIN role!');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
