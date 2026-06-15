import prisma from './prisma';

async function test() {
  console.log('1. Connecting...');
  await prisma.$connect();
  console.log('2. Connected! Running simple query SELECT 1...');
  const res = await prisma.$queryRaw`SELECT 1`;
  console.log('3. Simple query response:', res);
  
  console.log('4. Fetching dashboardMetric...');
  const stats = await prisma.dashboardMetric.findMany();
  console.log('5. Dashboard metrics:', stats);
  
  console.log('6. Done!');
  await prisma.$disconnect();
}

test().catch(err => {
  console.error('Test failed:', err);
});
