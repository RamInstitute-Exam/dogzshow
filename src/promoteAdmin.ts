import prisma from './prisma';

async function promoteAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email address. Usage: npx ts-node src/promoteAdmin.ts user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Success! User ${user.email} is now an ADMIN.`);
  } catch (error) {
    console.error(`❌ Failed to promote user. Ensure the email "${email}" exists in the database.`);
    console.error(error);
  }
}

promoteAdmin();
