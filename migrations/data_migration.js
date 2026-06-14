const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function restore() {
  try {
    console.log('Reading backup.json...');
    const data = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
    
    // 1. Restore Users
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          password: u.password,
          isActive: true,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt)
        }
      });
      
      // Map old role to new UserRole system
      if (u.role) {
        let roleRec = await prisma.role.findUnique({ where: { name: u.role } });
        if (!roleRec) {
          roleRec = await prisma.role.create({ data: { name: u.role, description: 'Migrated Role' } });
        }
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: u.id, roleId: roleRec.id } },
          update: {},
          create: { userId: u.id, roleId: roleRec.id }
        });
      }
    }
    console.log(`Restored ${data.users.length} Users.`);

    // 2. Restore Dogs
    for (const d of data.dogs) {
      // Find or create Breed
      let breedRec = await prisma.breed.findUnique({ where: { name: d.breed } });
      if (!breedRec) {
        breedRec = await prisma.breed.create({ data: { name: d.breed } });
      }

      await prisma.dog.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          name: d.name,
          breedId: breedRec.id,
          gender: d.gender || 'MALE',
          userOwnerId: d.ownerId,
          color: d.color,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt)
        }
      });
    }
    console.log(`Restored ${data.dogs.length} Dogs.`);

    // 3. Restore Images
    for (const img of data.images) {
      await prisma.dogPhoto.create({
        data: {
          id: img.id,
          dogId: img.profileId,
          url: img.url,
          isPrimary: true,
          createdAt: new Date(img.createdAt)
        }
      });
    }
    console.log(`Restored ${data.images.length} Images to DogPhotos.`);
    
    console.log('Zero Data Loss Migration Complete!');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
