const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const judgesMenu = await prisma.menu.findFirst({ where: { name: 'Judges', position: 'NAVBAR' } });
  if (judgesMenu) {
    console.log('Found Judges menu:', judgesMenu.id);
    const result = await prisma.menu.deleteMany({ where: { parentId: judgesMenu.id } });
    console.log('Deleted sub-menus:', result.count);
  } else {
    console.log('Judges menu not found');
  }
}

run().finally(() => prisma.$disconnect());
