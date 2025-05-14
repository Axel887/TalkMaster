import { PrismaClient } from '../generated/prisma';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: 'secure123',
      firstName: 'Alice',
      lastName: 'Doe',
      role: 'admin',
    },
  });

  // Create a room
  const room = await prisma.room.create({
    data: {
      name: 'Main Room',
    },
  });

  // Create a talk
  const talk = await prisma.talk.create({
    data: {
      title: 'Introduction to Prisma',
      duration: 1,
      subject: 'Databases',
      date: new Date(), // today
      description: 'How to use Prisma with TypeScript',
      status: 'confirmed',
      userId: user.id,
      roomId: room.id,
    },
  });

  // Create a favorite (talk liked by user)
  await prisma.favorite.create({
    data: {
      userId: user.id,
      talkId: talk.id,
    },
  });

  // Create a slot (reservation)
  await prisma.slot.create({
    data: {
      date: new Date(), // today
      roomId: room.id,
      userId: user.id,
      talkId: talk.id,
    },
  });

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
