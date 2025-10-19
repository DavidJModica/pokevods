const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkChapters() {
  const chapters = await prisma.chapter.findMany({
    include: {
      resource: {
        select: {
          title: true
        }
      },
      opposingDeck: {
        select: {
          name: true
        }
      }
    }
  });

  console.log(`\nFound ${chapters.length} chapters:`);
  chapters.forEach(chapter => {
    console.log(`\n- ${chapter.timestamp} | ${chapter.title || 'Untitled'}`);
    console.log(`  Resource: ${chapter.resource.title}`);
    console.log(`  Type: ${chapter.chapterType}`);
    if (chapter.opposingDeck) {
      console.log(`  vs ${chapter.opposingDeck.name}`);
    }
  });

  await prisma.$disconnect();
}

checkChapters();
