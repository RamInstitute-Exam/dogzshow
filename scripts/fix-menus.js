const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all menus...');
  const menus = await prisma.menu.findMany();

  const updates = [
    { name: 'Home', url: '/' },
    { name: 'Media Gallery', url: '/gallery' },
    { name: 'Entries', url: '/entries' },
    { name: 'Show Calendar', url: '/shows' },
    { name: 'Judges', url: '/judges' },
    { name: 'Clubs', url: '/clubs' }
  ];

  for (const menu of menus) {
    if (menu.url === '#' || menu.url === 'javascript:void(0)' || menu.url === '') {
      const target = updates.find(u => menu.name.includes(u.name) || menu.name.toLowerCase() === u.name.toLowerCase());
      
      if (target) {
        console.log(`Fixing menu "${menu.name}" (${menu.url}) -> ${target.url}`);
        await prisma.menu.update({
          where: { id: menu.id },
          data: { url: target.url }
        });
      } else {
        // Just make sure it points to something harmless if not matched
        console.log(`Menu "${menu.name}" has placeholder but no direct match. Changing # to /`);
        await prisma.menu.update({
          where: { id: menu.id },
          data: { url: '/' }
        });
      }
    } else {
      // Also check if any existing URLs need corrections (e.g. if Judges is set to /some-wrong-url)
      const target = updates.find(u => menu.name.toLowerCase() === u.name.toLowerCase());
      if (target && menu.url !== target.url) {
        console.log(`Correcting menu "${menu.name}" (${menu.url}) -> ${target.url}`);
        await prisma.menu.update({
          where: { id: menu.id },
          data: { url: target.url }
        });
      }
    }
  }

  console.log('Menu fixing complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
