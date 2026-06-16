import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@juzdog.com';
  const password = 'admin123';
  const roleName = 'SUPER_ADMIN';

  // Ensure role exists
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: roleName,
        description: 'Super Administrator',
        status: 'ACTIVE',
      }
    });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists. Skipping creation.`);
    
    // Just in case they don't have the role linked, link it:
    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: existingUser.id,
          roleId: role.id
        }
      }
    });
    
    if (!userRole) {
      await prisma.userRole.create({
        data: {
          userId: existingUser.id,
          roleId: role.id
        }
      });
      console.log(`Linked SUPER_ADMIN role to existing user.`);
    }
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      mobileVerified: true,
      provider: 'local',
      roles: {
        create: {
          roleId: role.id
        }
      }
    }
  });

  console.log(`Successfully created Super Admin: ${user.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
