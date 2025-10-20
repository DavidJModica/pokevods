require('dotenv').config({ path: '.env.local' });
const prisma = require('../lib/prisma');
const fetch = require('node-fetch');

// Function to fetch YouTube metadata
async function fetchYouTubeMetadata(videoUrl) {
  try {
    // Fetch the video page to get publication date
    const videoResponse = await fetch(videoUrl);
    const videoHtml = await videoResponse.text();

    // Extract publication date
    const dateMatch = videoHtml.match(/"publishDate":"([^"]+)"/);
    const publicationDate = dateMatch ? dateMatch[1] : null;

    return publicationDate;
  } catch (error) {
    console.error(`Error fetching metadata for ${videoUrl}:`, error.message);
    return null;
  }
}

async function fixMissingDates() {
  console.log('🔍 Scanning database for videos without publication dates...\n');

  try {
    // Find all resources without publication dates
    const resourcesWithoutDates = await prisma.resource.findMany({
      where: {
        publicationDate: null
      },
      select: {
        id: true,
        title: true,
        url: true,
        author: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    console.log(`Found ${resourcesWithoutDates.length} videos without publication dates\n`);

    if (resourcesWithoutDates.length === 0) {
      console.log('✅ All videos have publication dates!');
      await prisma.$disconnect();
      return;
    }

    let fixed = 0;
    let failed = 0;
    let usedFallback = 0;

    for (let i = 0; i < resourcesWithoutDates.length; i++) {
      const resource = resourcesWithoutDates[i];

      console.log(`\n[${i + 1}/${resourcesWithoutDates.length}] Processing: ${resource.title}`);
      console.log(`   URL: ${resource.url}`);

      // Try to fetch publication date from YouTube
      const publicationDate = await fetchYouTubeMetadata(resource.url);

      if (publicationDate) {
        // Update the resource with the found date
        await prisma.resource.update({
          where: { id: resource.id },
          data: { publicationDate: new Date(publicationDate) }
        });

        console.log(`   ✅ Found date: ${new Date(publicationDate).toLocaleDateString()}`);
        fixed++;
      } else {
        // Use today's date as fallback
        await prisma.resource.update({
          where: { id: resource.id },
          data: { publicationDate: new Date() }
        });

        console.log(`   ⚠️  Could not find date, using today as fallback`);
        usedFallback++;
      }

      // Add a small delay to avoid rate limiting
      if (i < resourcesWithoutDates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));
    console.log(`Total videos processed: ${resourcesWithoutDates.length}`);
    console.log(`✅ Dates found and updated: ${fixed}`);
    console.log(`⚠️  Used today's date as fallback: ${usedFallback}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixMissingDates();
