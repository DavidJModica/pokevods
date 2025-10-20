const prisma = require('../lib/prisma');

const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

module.exports = async function handler(req, res) {
  const { method } = req;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Scanning Matchup Queue for old videos...');

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

    console.log(`📊 Total gameplay videos found: ${matchupResources.length}`);

    const deletedVideos = [];
    const keptVideos = [];
    let noDateCount = 0;

    for (const resource of matchupResources) {
      // Check if video is in matchup queue (has no matchup chapters OR has chapters without opposing deck)
      const hasMatchupChapters = resource.chapters.some(
        chapter => chapter.chapterType === 'Matchup' && chapter.opposingDeckId
      );

      // Only process resources in matchup queue (no proper matchup chapters assigned)
      if (hasMatchupChapters) {
        keptVideos.push({
          id: resource.id,
          title: resource.title,
          reason: 'Has matchup chapters'
        });
        continue; // Skip resources that already have matchup chapters assigned
      }

      // Check publication date
      if (!resource.publicationDate) {
        console.log(`⚠️  No date: "${resource.title}"`);

        await prisma.resource.delete({
          where: { id: resource.id }
        });

        deletedVideos.push({
          id: resource.id,
          title: resource.title,
          deck: resource.deck?.name || 'Unknown',
          reason: 'No publication date',
          url: resource.url
        });

        noDateCount++;
        continue;
      }

      const videoDate = new Date(resource.publicationDate);

      // Delete if older than format date
      if (videoDate < MEGA_EVOLUTIONS_FORMAT_DATE) {
        console.log(`📅 Old video: "${resource.title}" (${videoDate.toLocaleDateString()})`);

        await prisma.resource.delete({
          where: { id: resource.id }
        });

        deletedVideos.push({
          id: resource.id,
          title: resource.title,
          deck: resource.deck?.name || 'Unknown',
          date: videoDate.toLocaleDateString(),
          reason: `Before ${MEGA_EVOLUTIONS_FORMAT_DATE.toLocaleDateString()}`,
          url: resource.url
        });
      } else {
        keptVideos.push({
          id: resource.id,
          title: resource.title,
          deck: resource.deck?.name || 'Unknown',
          date: videoDate.toLocaleDateString(),
          reason: 'Current format'
        });
      }
    }

    const summary = {
      totalScanned: matchupResources.length,
      deleted: deletedVideos.length,
      noDateDeleted: noDateCount,
      oldFormatDeleted: deletedVideos.length - noDateCount,
      kept: keptVideos.length,
      deletedVideos,
      keptVideos: keptVideos.slice(0, 20) // Only return first 20 kept videos to avoid large response
    };

    console.log(`✅ Cleanup complete: ${deletedVideos.length} deleted, ${keptVideos.length} kept`);

    return res.status(200).json(summary);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
