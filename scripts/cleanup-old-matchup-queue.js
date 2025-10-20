require('dotenv').config({ path: '.env.production' });
const prisma = require('../lib/prisma');

const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

async function cleanupOldMatchupQueue() {
  console.log('🔍 Scanning Matchup Queue for old videos...\n');
  console.log(`Format cutoff date: ${MEGA_EVOLUTIONS_FORMAT_DATE.toLocaleDateString()}\n`);

  try {
    // Fetch all resources from matchup queue (gameplay videos)
    const matchupResources = await prisma.resource.findMany({
      where: {
        status: 'approved',
        type: {
          in: ['Gameplay', 'Guide and Gameplay']
        }
      },
      include: {
        chapters: {
          include: {
            opposingDeck: true
          }
        },
        deck: true
      },
      orderBy: { publicationDate: 'desc' }
    });

    console.log(`📊 Total gameplay videos found: ${matchupResources.length}\n`);

    let deletedCount = 0;
    let keptCount = 0;
    let noDateCount = 0;

    for (const resource of matchupResources) {
      // Check if video is in matchup queue (has no matchup chapters OR has chapters without opposing deck)
      const hasMatchupChapters = resource.chapters.some(
        chapter => chapter.chapterType === 'Matchup' && chapter.opposingDeckId
      );

      // Only process resources in matchup queue (no proper matchup chapters)
      if (hasMatchupChapters) {
        keptCount++;
        continue; // Skip resources that already have matchup chapters assigned
      }

      // Check publication date
      if (!resource.publicationDate) {
        console.log(`⚠️  No date: "${resource.title}"`);
        console.log(`   Deck: ${resource.deck?.name || 'Unknown'}`);
        console.log(`   URL: ${resource.url}`);
        console.log(`   ❌ DELETING (no date available)\n`);

        await prisma.resource.delete({
          where: { id: resource.id }
        });

        deletedCount++;
        noDateCount++;
        continue;
      }

      const videoDate = new Date(resource.publicationDate);

      // Delete if older than format date
      if (videoDate < MEGA_EVOLUTIONS_FORMAT_DATE) {
        console.log(`📅 Old video: "${resource.title}"`);
        console.log(`   Date: ${videoDate.toLocaleDateString()}`);
        console.log(`   Deck: ${resource.deck?.name || 'Unknown'}`);
        console.log(`   Chapters: ${resource.chapters.length}`);
        console.log(`   URL: ${resource.url}`);
        console.log(`   ❌ DELETING\n`);

        await prisma.resource.delete({
          where: { id: resource.id }
        });

        deletedCount++;
      } else {
        console.log(`✅ Current video: "${resource.title}"`);
        console.log(`   Date: ${videoDate.toLocaleDateString()}`);
        console.log(`   Deck: ${resource.deck?.name || 'Unknown'}`);
        console.log(`   Chapters: ${resource.chapters.length}`);
        console.log(`   ⏭️  KEEPING\n`);

        keptCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total gameplay videos scanned: ${matchupResources.length}`);
    console.log(`Videos deleted (old): ${deletedCount}`);
    console.log(`  - Videos with no date: ${noDateCount}`);
    console.log(`  - Videos before ${MEGA_EVOLUTIONS_FORMAT_DATE.toLocaleDateString()}: ${deletedCount - noDateCount}`);
    console.log(`Videos kept (current): ${keptCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupOldMatchupQueue()
  .then(() => {
    console.log('\n✅ Matchup queue cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  });
