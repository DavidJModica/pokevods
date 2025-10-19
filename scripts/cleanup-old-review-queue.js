require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

// Format cutoff date (Sept 25, 2025)
const CUTOFF_DATE = new Date('2025-09-25');

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Fetch publication date from YouTube
async function fetchPublicationDate(url) {
  try {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      console.log('    ⚠️  Could not extract video ID from URL');
      return null;
    }

    const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await pageResponse.text();

    // Look for uploadDate in the JSON-LD structured data
    const uploadDateMatch = html.match(/"uploadDate":"([^"]+)"/);
    if (uploadDateMatch && uploadDateMatch[1]) {
      return uploadDateMatch[1];
    }

    console.log('    ⚠️  Could not find publication date in YouTube page');
    return null;
  } catch (error) {
    console.log(`    ❌ Error fetching from YouTube: ${error.message}`);
    return null;
  }
}

async function cleanupOldReviewQueue() {
  console.log('🧹 Cleaning up old videos from Review Queue...\n');
  console.log(`📅 Cutoff date: ${CUTOFF_DATE.toLocaleDateString()}\n`);

  try {
    // Get all pending resources
    const pendingResources = await prisma.resource.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${pendingResources.length} videos in Review Queue\n`);

    let deletedCount = 0;
    let keptCount = 0;
    let noDatesCount = 0;

    for (const resource of pendingResources) {
      console.log(`\n🎥 Checking: ${resource.title}`);
      console.log(`   URL: ${resource.url}`);

      let publicationDate = resource.publicationDate;

      // If no publication date in database, fetch from YouTube
      if (!publicationDate) {
        console.log('   📡 No date in database, fetching from YouTube...');
        const fetchedDate = await fetchPublicationDate(resource.url);

        if (fetchedDate) {
          publicationDate = new Date(fetchedDate);
          console.log(`   ✅ Found date: ${publicationDate.toLocaleDateString()}`);

          // Update the database with the fetched date
          await prisma.resource.update({
            where: { id: resource.id },
            data: { publicationDate: publicationDate }
          });
        } else {
          console.log('   ⚠️  No publication date available - DELETING (safety measure)');
          await prisma.resource.delete({
            where: { id: resource.id }
          });
          deletedCount++;
          noDatesCount++;
          continue;
        }
      } else {
        console.log(`   📅 Database date: ${new Date(publicationDate).toLocaleDateString()}`);
      }

      // Check if video is old
      const videoDate = new Date(publicationDate);
      if (videoDate < CUTOFF_DATE) {
        console.log(`   ❌ OLD VIDEO - Deleting (${videoDate.toLocaleDateString()} < ${CUTOFF_DATE.toLocaleDateString()})`);
        await prisma.resource.delete({
          where: { id: resource.id }
        });
        deletedCount++;
      } else {
        console.log(`   ✅ KEEPING (${videoDate.toLocaleDateString()} >= ${CUTOFF_DATE.toLocaleDateString()})`);
        keptCount++;
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`🗑️  Deleted: ${deletedCount} videos`);
    console.log(`   - Old videos (before ${CUTOFF_DATE.toLocaleDateString()}): ${deletedCount - noDatesCount}`);
    console.log(`   - Videos with no date: ${noDatesCount}`);
    console.log(`✅ Kept: ${keptCount} videos`);
    console.log(`📝 Total processed: ${pendingResources.length} videos`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldReviewQueue();
