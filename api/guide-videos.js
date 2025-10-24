const prisma = require('../lib/prisma');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Guide videos endpoint called');
    console.log('📦 Prisma client loaded');

    // Find all resources that are NOT "Gameplay" or "Guide and Gameplay"
    const resources = await prisma.resource.findMany({
      where: {
        AND: [
          {
            type: {
              not: 'Gameplay'
            }
          },
          {
            type: {
              not: 'Guide and Gameplay'
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
        authorProfile: {
          select: {
            id: true,
            name: true,
            slug: true
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

    console.log(`✅ Guide videos query returned ${resources.length} resources`);
    res.status(200).json(resources);
  } catch (error) {
    console.error('❌ Guide videos API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
