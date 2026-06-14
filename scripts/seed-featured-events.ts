import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findFirst({
    where: { status: 'PUBLISHED' }
  });

  if (event) {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        isFeatured: true,
        judgesCount: 5,
        displayOrder: 1,
        featuredImage: '/images/events_banner.png',
        cardImage: '/images/events_banner.png'
      }
    });
    console.log(`Updated event ${event.name} to be featured.`);
  } else {
    console.log("No published event found. Trying to find any event...");
    const draftEvent = await prisma.event.findFirst();
    if (draftEvent) {
      await prisma.event.update({
        where: { id: draftEvent.id },
        data: {
          status: 'PUBLISHED',
          isFeatured: true,
          judgesCount: 5,
          displayOrder: 1,
          featuredImage: '/images/events_banner.png',
          cardImage: '/images/events_banner.png'
        }
      });
      console.log(`Updated draft event ${draftEvent.name} to be featured and published.`);
    } else {
      console.log("No events found in DB.");
    }
  }

  // Update remaining events to PUBLISHED so they appear in grid
  await prisma.event.updateMany({
    where: {
      status: 'DRAFT',
      id: { not: event?.id || '' }
    },
    data: {
      status: 'PUBLISHED',
      isFeatured: false,
      judgesCount: 3,
      cardImage: '/images/gallery_banner.png'
    }
  });
  console.log("Updated other events to PUBLISHED.");
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
