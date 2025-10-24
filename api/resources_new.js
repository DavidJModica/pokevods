const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  const { method } = req;

  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET': {
        const { deckId, id, status, type, accessType } = req.query;

        // Add caching headers for GET requests
        // Don't cache pending resources (admin data changes frequently)
        // Cache approved resources for 5 minutes
        if (status !== 'pending') {
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        }

        // Get single resource by ID
        if (id) {
          const resource = await prisma.resource.findUnique({
            where: { id: parseInt(id) },
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
            }
          });
          return res.status(200).json(resource);
        }

        // Get pending resources (for review queue)
        if (status === 'pending') {
          const pendingResources = await prisma.resource.findMany({
            where: { status: 'pending' },
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
          return res.status(200).json(pendingResources);
        }

        // Get resources by type or accessType (for homepage sections)
        if (type || accessType) {
          const whereClause = {
            status: 'approved'
          };

          if (type) {
            whereClause.type = type;
          }

          if (accessType) {
            whereClause.accessType = accessType;
          }

          const filteredResources = await prisma.resource.findMany({
            where: whereClause,
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
            orderBy: { publicationDate: 'desc' }
          });
          return res.status(200).json(filteredResources);
        }

// Get all resources (for admin management) when no deckId provided
        if (!deckId) {
          const allResources = await prisma.resource.findMany({
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
          return res.status(200).json(allResources);
        }

        // Get all resources for a specific deck (only approved by default)