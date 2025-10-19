const prisma = require('../lib/prisma');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Matchup queue endpoint called');
    console.log('📦 Prisma client loaded');

    // Find approved resources where:
    // 1. At least one chapter has chapterType='Matchup' but opposingDeckId is null, OR
    // 2. Type contains "Gameplay" but has no matchup chapters at all
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

    console.log(`✅ Matchup queue query returned ${resources.length} resources`);
    res.status(200).json(resources);
  } catch (error) {
    console.error('❌ Matchup queue API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
