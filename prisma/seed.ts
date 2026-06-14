import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding massive demo database...');
  
  // 1. Roles
  console.log('Creating Roles...');
  const roleNames = ['Super Admin', 'Admin', 'Club Admin', 'Judge', 'Reception', 'Finance', 'Manager', 'Staff', 'User'];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }

  // 2. Users (50)
  console.log('Generating 50 Users...');
  const users = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(), // In production this would be hashed
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        provider: 'local'
      }
    });
    users.push(user);
  }

  // 3. Clubs (20)
  console.log('Generating 20 Clubs...');
  const clubs = [];
  for (let i = 0; i < 20; i++) {
    const club = await prisma.club.create({
      data: {
        name: faker.company.name() + ' Kennel Club',
        description: faker.company.catchPhrase(),
        address: faker.location.streetAddress(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      }
    });
    clubs.push(club);
  }

  // 4. Judges (30)
  console.log('Generating 30 Judges...');
  const judges = [];
  for (let i = 0; i < 30; i++) {
    const judge = await prisma.judge.create({
      data: {
        name: faker.person.fullName(),
        country: faker.location.country(),
        experience: faker.number.int({ min: 5, max: 30 }) + ' years',
        bio: faker.lorem.paragraph(),
      }
    });
    judges.push(judge);
  }

  // 5. FCI Groups & Breeds
  console.log('Generating 10 FCI Groups & Breeds...');
  const groups = [];
  for (let i = 1; i <= 10; i++) {
    const group = await prisma.fCIGroup.upsert({
      where: { groupNumber: i },
      update: {},
      create: {
        groupNumber: i,
        name: `Group ${i}`,
        description: faker.lorem.sentence(),
      }
    });
    groups.push(group);

    // 10 breeds per group = 100 breeds
    for (let j = 0; j < 10; j++) {
      await prisma.breed.create({
        data: {
          name: faker.animal.dog() + ` (${i}-${j})`,
          fciGroupId: group.id
        }
      });
    }
  }

  const allBreeds = await prisma.breed.findMany();

  // 6. Dogs (500)
  console.log('Generating 500 Dogs...');
  const dogs = [];
  for (let i = 0; i < 500; i++) {
    const dog = await prisma.dog.create({
      data: {
        name: faker.person.firstName(),
        breedId: allBreeds[Math.floor(Math.random() * allBreeds.length)].id,
        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        dob: faker.date.past({ years: 10 }),
        color: faker.color.human(),
        kciNumber: `KCI-${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
        microchipNumber: faker.string.numeric(15),
        userOwnerId: users[Math.floor(Math.random() * users.length)].id,
        isChampion: Math.random() > 0.8,
      }
    });
    dogs.push(dog);
  }

  // Show Classes
  console.log('Creating Show Classes...');
  const classes = ['Minor Puppy', 'Puppy', 'Junior', 'Intermediate', 'Open', 'Breed In India', 'Champion', 'Veteran'];
  for (const c of classes) {
    await prisma.ageClass.upsert({
      where: { name: c },
      update: {},
      create: { name: c, description: c }
    });
  }

  const defaultCategory = await prisma.eventCategory.create({
    data: { eventId: "placeholder", name: "Open" } // Will be replaced in events
  }).catch(() => null);

  // 7. Events (50 Upcoming, 50 Completed)
  console.log('Generating 100 Events...');
  const events = [];
  for (let i = 0; i < 100; i++) {
    const isCompleted = i < 50;
    const startDate = isCompleted ? faker.date.past() : faker.date.future();
    const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        clubId: clubs[Math.floor(Math.random() * clubs.length)].id,
        name: faker.location.city() + (isCompleted ? ' National Show' : ' Championship'),
        type: 'FCI CACIB',
        startDate: startDate,
        endDate: endDate,
        venue: faker.location.city(),
        entryFee: faker.number.int({ min: 1000, max: 5000 }),
        status: isCompleted ? 'COMPLETED' : 'REGISTRATION_OPEN',
      }
    });
    
    // Create a default category for the event
    await prisma.eventCategory.create({
      data: { eventId: event.id, name: 'Open Class' }
    });

    events.push(event);
  }

  // 8. Registrations (200) & Payments (100)
  console.log('Generating 200 Registrations and 100 Payments...');
  const registrations = [];
  for (let i = 0; i < 200; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const dog = dogs[Math.floor(Math.random() * dogs.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    const category = await prisma.eventCategory.findFirst({ where: { eventId: event.id } });

    // Skip if somehow duplicate
    try {
      const reg = await prisma.eventRegistration.create({
        data: {
          serialNumber: `REG-${faker.string.alphanumeric(8).toUpperCase()}`,
          eventId: event.id,
          userId: user.id,
          dogId: dog.id,
          categoryId: category?.id || defaultCategory?.id || "unknown", // fallback
          status: 'CONFIRMED',
        }
      });
      registrations.push(reg);

      // Create payment for 50% of them
      if (i < 100) {
        await prisma.payment.create({
          data: {
            registrationId: reg.id,
            userId: user.id,
            amount: event.entryFee,
            status: 'SUCCESS',
            transactionId: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
            paymentGateway: 'RAZORPAY',
          }
        });
      }
    } catch (e) {
      // Ignore unique constraint violations
    }
  }

  // 9. Competition Rounds, Matches, Winners (100)
  console.log('Generating Competition Rounds, Matches, and 100 Winners...');
  let winnerCount = 0;
  for (const event of events.slice(0, 50)) { // Only for completed events
    if (winnerCount >= 100) break;
    
    const round = await prisma.competitionRound.create({
      data: {
        eventId: event.id,
        name: 'Final Round',
        level: 1,
        status: 'COMPLETED'
      }
    });

    for (let i = 0; i < 2; i++) {
      if (winnerCount >= 100) break;
      const dog = dogs[Math.floor(Math.random() * dogs.length)];
      
      const match = await prisma.competitionMatch.create({
        data: {
          roundId: round.id,
          dogId: dog.id,
          status: 'COMPLETED',
          score: faker.number.float({ min: 5, max: 10 })
        }
      });

      const winner = await prisma.winner.create({
        data: {
          matchId: match.id,
          awardTitle: i === 0 ? 'Best In Show' : 'Best of Breed',
          rank: i + 1,
          breedName: 'Retriever',
          competition: event.name,
          year: new Date(event.startDate).getFullYear()
        }
      });

      await prisma.winnerTag.create({
        data: {
          winnerId: winner.id,
          dogId: dog.id,
          award: winner.awardTitle,
          eventName: event.name,
          eventDate: event.startDate
        }
      });

      winnerCount++;
    }
  }

  // 10. Galleries (25)
  console.log('Generating 25 Galleries...');
  for (let i = 0; i < 25; i++) {
    await prisma.mediaGallery.create({
      data: {
        url: faker.image.urlLoremFlickr({ category: 'dog' }),
        type: 'PHOTO',
        category: 'DOG_SHOW',
        altText: faker.lorem.words(3),
      }
    });
  }

  // 11. Notifications (100)
  console.log('Generating 100 Notifications...');
  for (let i = 0; i < 100; i++) {
    await prisma.notification.create({
      data: {
        title: faker.lorem.words(4),
        message: faker.lorem.sentence(),
        notificationType: 'IN_APP',
        category: 'SYSTEM',
        receiverId: users[Math.floor(Math.random() * users.length)].id,
        isRead: Math.random() > 0.5,
      }
    });
  }

  console.log('🎉 Massive Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
