const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all initial data in parallel for better performance
    const [decks, tierListResources, tournamentResources, paidGuides] = await Promise.all([
      // Fetch all decks (not hidden)
      prisma.deck.findMany({
        where: { hidden: false },
        orderBy: { name: 'asc' }
      }),

      // Fetch tier list resources
      prisma.resource.findMany({
        where: {
          type: 'Tierlist',
          status: 'approved'
        },
        include: {
          deck: {
            select: {
              id: true,
              name: true,
              archetype: true
            }
          },
          authorProfile: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { publicationDate: 'desc' }
      }),

      // Fetch tournament report resources
      prisma.resource.findMany({
        where: {
          type: 'Tournament Report',
          status: 'approved'
        },
        include: {
          deck: {
            select: {
              id: true,
              name: true,
              archetype: true
            }
          },
          authorProfile: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { publicationDate: 'desc' }
      }),

      // Fetch paid guides
      prisma.resource.findMany({
        where: {
          accessType: 'Paid',
          status: 'approved'
        },
        include: {
          deck: {
            select: {
              id: true,
              name: true,
              archetype: true
            }
          },
          authorProfile: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { publicationDate: 'desc' }
      })
    ]);

    // Return all data in a single response
    return res.status(200).json({
      success: true,
      data: {
        decks,
        tierListResources,
        tournamentResources,
        paidGuides
      }
    });

  } catch (error) {
    console.error('Error fetching initial data:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
};
