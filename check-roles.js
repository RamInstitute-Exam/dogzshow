const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
  console.log(JSON.stringify(users.map(u => ({
    email: u.email,
    roles: u.roles.map(r => r.role.name)
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
