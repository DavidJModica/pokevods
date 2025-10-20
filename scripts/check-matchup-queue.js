require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

// Map DATABASE_URL and DIRECT_URL to PRISMA variables
process.env.PRISMA_DATABASE_URL = process.env.DATABASE_URL;
process.env.POSTGRES_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();

async function checkMatchupQueue() {
  console.log('📊 Checking Matchup Queue Status...\n');

  try {
    // Find all gameplay videos without any chapters
    const gameplayNoChapters = await prisma.resource.findMany({
      where: {
        status: 'approved',
        type: {
          contains: 'Gameplay'
        },
        chapters: {
          none: {}
        }
      },
      include: {
        deck: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`🎮 Gameplay videos with NO chapters: ${gameplayNoChapters.length}`);
    if (gameplayNoChapters.length > 0) {
      console.log('\nList of gameplay videos without chapters:');
      gameplayNoChapters.forEach((resource, idx) => {
        console.log(`${idx + 1}. ${resource.title}`);
        console.log(`   Deck: ${resource.deck?.name || 'None'}`);
        console.log(`   Type: ${resource.type}`);
        console.log(`   URL: ${resource.url}\n`);
      });
    }

    // Find gameplay videos without matchup chapters
    const gameplayNoMatchupChapters = await prisma.resource.findMany({
      where: {
        status: 'approved',
        type: {
          contains: 'Gameplay'
        },
        chapters: {
          none: {
            chapterType: 'Matchup'
          }
        }
      },
      include: {
        deck: {
          select: {
            name: true
          }
        },
        chapters: true
      }
    });

    const withSomeChapters = gameplayNoMatchupChapters.filter(r => r.chapters.length > 0);

    console.log(`\n🎯 Gameplay videos with chapters but NO matchup chapters: ${withSomeChapters.length}`);
    if (withSomeChapters.length > 0) {
      console.log('\nList:');
      withSomeChapters.forEach((resource, idx) => {
        console.log(`${idx + 1}. ${resource.title}`);
        console.log(`   Deck: ${resource.deck?.name || 'None'}`);
        console.log(`   Total chapters: ${resource.chapters.length}`);
        console.log(`   Chapter types: ${resource.chapters.map(c => c.chapterType).join(', ')}`);
        console.log(`   URL: ${resource.url}\n`);
      });
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log(`Total gameplay videos that need matchup review: ${gameplayNoChapters.length + withSomeChapters.length}`);
    console.log(`  - With no chapters at all: ${gameplayNoChapters.length}`);
    console.log(`  - With chapters but no matchup chapters: ${withSomeChapters.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkMatchupQueue()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
