const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixChapters() {
  // Get the video and all its chapters
  const resource = await prisma.resource.findFirst({
    where: {
      url: 'https://www.youtube.com/watch?v=p3Ic2IeVY7c'
    },
    include: {
      chapters: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  if (!resource) {
    console.log('❌ Video not found');
    return;
  }

  console.log('📹 Video:', resource.title);
  console.log('Current chapters:', resource.chapters.length);

  // Find Gholdengo Joltik deck
  const gholdengoJoltikDeck = await prisma.deck.findFirst({
    where: {
      OR: [
        { name: { contains: 'Gholdengo', mode: 'insensitive' } },
        { name: { contains: 'Joltik', mode: 'insensitive' } }
      ]
    }
  });

  if (gholdengoJoltikDeck) {
    console.log('✅ Found deck:', gholdengoJoltikDeck.name, '(ID:', gholdengoJoltikDeck.id + ')');
  } else {
    console.log('⚠️  Could not find Gholdengo Joltik deck');
  }

  // Update the Joltik chapter to associate with the deck
  const joltikChapter = resource.chapters.find(
    ch => ch.title === 'Gholdengo Joltik Box'
  );

  if (joltikChapter && gholdengoJoltikDeck) {
    await prisma.chapter.update({
      where: { id: joltikChapter.id },
      data: {
        opposingDeckId: gholdengoJoltikDeck.id
      }
    });
    console.log('✅ Associated Joltik chapter with', gholdengoJoltikDeck.name);
  }

  // Show final chapter order
  const updatedResource = await prisma.resource.findFirst({
    where: { id: resource.id },
    include: {
      chapters: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  console.log('\n--- Final Chapter Order (sorted by timestamp) ---');
  updatedResource.chapters.forEach((chapter, index) => {
    console.log(`${index + 1}. [${chapter.timestamp}] ${chapter.title} ${chapter.opposingDeckId ? '(✓ deck linked)' : ''}`);
  });

  await prisma.$disconnect();
}

fixChapters().catch(console.error);
