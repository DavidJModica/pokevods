const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkChapters() {
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
    console.log('❌ Video not found in database');
    process.exit(0);
  }

  console.log('📹 Video:', resource.title || 'No title');
  console.log('📊 Total chapters:', resource.chapters.length);
  console.log('\n--- All Chapters ---');
  resource.chapters.forEach((chapter, index) => {
    console.log(`${index + 1}. [${chapter.timestamp}] ${chapter.title}`);
  });

  if (resource.chapters.length > 0) {
    const lastChapter = resource.chapters[resource.chapters.length - 1];
    console.log('\n--- Last Chapter Details ---');
    console.log('Title:', lastChapter.title);
    console.log('Timestamp:', lastChapter.timestamp);
    console.log('Deck 1 ID:', lastChapter.deck1Id);
    console.log('Deck 2 ID:', lastChapter.deck2Id);
    console.log('Created:', lastChapter.createdAt);
  }

  await prisma.$disconnect();
}

checkChapters().catch(console.error);
