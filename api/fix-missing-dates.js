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

module.exports = async function handler(req, res) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('🔍 Scanning database for videos without publication dates...');

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

    console.log(`Found ${resourcesWithoutDates.length} videos without publication dates`);

    if (resourcesWithoutDates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All videos have publication dates!',
        totalProcessed: 0,
        datesFound: 0,
        usedFallback: 0
      });
    }

    let datesFound = 0;
    let usedFallback = 0;
    const processedVideos = [];

    for (let i = 0; i < resourcesWithoutDates.length; i++) {
      const resource = resourcesWithoutDates[i];

      console.log(`\n[${i + 1}/${resourcesWithoutDates.length}] Processing: ${resource.title}`);

      // Try to fetch publication date from YouTube
      const publicationDate = await fetchYouTubeMetadata(resource.url);

      if (publicationDate) {
        // Update the resource with the found date
        await prisma.resource.update({
          where: { id: resource.id },
          data: { publicationDate: new Date(publicationDate) }
        });

        console.log(`   ✅ Found date: ${new Date(publicationDate).toLocaleDateString()}`);
        processedVideos.push({
          id: resource.id,
          title: resource.title,
          date: new Date(publicationDate).toLocaleDateString(),
          method: 'found'
        });
        datesFound++;
      } else {
        // Use today's date as fallback
        await prisma.resource.update({
          where: { id: resource.id },
          data: { publicationDate: new Date() }
        });

        console.log(`   ⚠️  Could not find date, using today as fallback`);
        processedVideos.push({
          id: resource.id,
          title: resource.title,
          date: new Date().toLocaleDateString(),
          method: 'fallback'
        });
        usedFallback++;
      }

      // Add a small delay to avoid rate limiting
      if (i < resourcesWithoutDates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Processing complete: ${datesFound} found, ${usedFallback} fallback`);

    return res.status(200).json({
      success: true,
      message: 'Date fix completed',
      totalProcessed: resourcesWithoutDates.length,
      datesFound: datesFound,
      usedFallback: usedFallback,
      processedVideos: processedVideos.slice(0, 10) // Return first 10 for display
    });

  } catch (error) {
    console.error('❌ Error fixing dates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fix missing dates',
      details: error.message
    });
  }
};
