import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  console.log('Starting Super Admin seeding...');
  const email = 'admin@juzdog.com';

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists. Seeding skipped to prevent duplicate.`);
      return;
    }

    // 2. Hash password with minimum salt rounds of 12
    console.log('Hashing password...');
    const saltRounds = 12;
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // 3. Ensure target roles exist (both SUPER_ADMIN and Super Admin for compatibility)
    console.log('Ensuring roles exist in database...');
    const rolesToUpsert = [
      { name: 'SUPER_ADMIN', displayName: 'Super Admin', priority: 100 },
      { name: 'Super Admin', displayName: 'Super Admin', priority: 100 }
    ];

    const roleMap: Record<string, string> = {};
    for (const r of rolesToUpsert) {
      const dbRole = await prisma.role.upsert({
        where: { name: r.name },
        update: { priority: r.priority },
        create: {
          name: r.name,
          displayName: r.displayName,
          description: `${r.displayName} role`,
          priority: r.priority,
        },
      });
      roleMap[r.name] = dbRole.id;
    }

    // 4. Create the User record
    console.log('Creating User record...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        mobileVerified: true,
        // terms and preferences
        prefSms: true,
        prefEmail: true,
        prefWhatsapp: true,
        termsAccepted: true,
        privacyAccepted: true,
      },
    });

    // 5. Link User to both roles
    console.log('Linking User to roles...');
    for (const roleName of Object.keys(roleMap)) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleMap[roleName],
        },
      });
    }

    console.log('🎉 Super Admin account created successfully!');
    console.log('---------------------------------------------');
    console.log(`Email    : ${email}`);
    console.log(`Password : ${plainPassword}`);
    console.log(`Roles    : ${Object.keys(roleMap).join(', ')}`);
    console.log(`Status   : Active`);
    console.log('---------------------------------------------');

  } catch (error) {
    console.error('Failed to seed Super Admin user:', error);
    throw error;
  }
}

seedSuperAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
