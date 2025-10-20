require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

// Map DATABASE_URL and DIRECT_URL to PRISMA variables
process.env.PRISMA_DATABASE_URL = process.env.DATABASE_URL;
process.env.POSTGRES_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();

async function testMatchupQueueQuery() {
  console.log('🔍 Testing matchup queue query (same as API endpoint)...\n');

  try {
    // This is the EXACT query from server.js lines 37-85
    const resources = await prisma.resource.findMany({
      where: {
        status: 'approved',
        OR: [
          {
            // Has matchup chapters missing opponent deck
            chapters: {
              some: {
                chapterType: 'Matchup',
                opposingDeckId: null
              }
            }
          },
          {
            // Is Gameplay type but has no matchup chapters
            type: {
              contains: 'Gameplay'
            },
            chapters: {
              none: {
                chapterType: 'Matchup'
              }
            }
          }
        ]
      },
      include: {
        deck: {
          select: {
            id: true,
            name: true,
            icons: true
          }
        },
        chapters: {
          include: {
            opposingDeck: {
              select: {
                id: true,
                name: true,
                icons: true
              }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Query returned ${resources.length} resources\n`);

    if (resources.length > 0) {
      console.log('First 5 resources:');
      resources.slice(0, 5).forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.title}`);
        console.log(`   Type: ${r.type}`);
        console.log(`   Deck: ${r.deck?.name || 'None'}`);
        console.log(`   Chapters: ${r.chapters.length}`);
        console.log(`   Matchup chapters: ${r.chapters.filter(c => c.chapterType === 'Matchup').length}\n`);
      });
    } else {
      console.log('❌ No resources returned - investigating why...\n');

      // Test each condition separately
      const gameplay = await prisma.resource.count({
        where: {
          status: 'approved',
          type: { contains: 'Gameplay' }
        }
      });
      console.log(`Total approved Gameplay resources: ${gameplay}`);

      const gameplayNoMatchup = await prisma.resource.count({
        where: {
          status: 'approved',
          type: { contains: 'Gameplay' },
          chapters: {
            none: {
              chapterType: 'Matchup'
            }
          }
        }
      });
      console.log(`Gameplay with no Matchup chapters: ${gameplayNoMatchup}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testMatchupQueueQuery()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
