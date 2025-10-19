const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { deckId, id, status } = req.query;

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

        // Get all resources for a deck (only approved by default)
        if (!deckId) {
          return res.status(400).json({ error: 'Deck ID is required' });
        }

        const resources = await prisma.resource.findMany({
          where: {
            deckId: parseInt(deckId),
            status: 'approved' // Only show approved resources on deck pages
          },
          include: {
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

        return res.status(200).json(resources);
      }

      case 'POST': {
        const { deckId, type, title, url, author, platform, accessType, publicationDate, thumbnail, decklist, status } = req.body;

        // DeckId is optional for Tierlist and Metagame Discussion
        const deckRequired = !['Tierlist', 'Metagame Discussion'].includes(type);
        if (deckRequired && !deckId) {
          return res.status(400).json({ error: 'DeckId is required for this resource type' });
        }

        if (!type || !title || !url) {
          return res.status(400).json({ error: 'Type, title, and url are required' });
        }

        // Check for duplicate URL
        const existingResource = await prisma.resource.findFirst({
          where: { url: url }
        });

        if (existingResource) {
          return res.status(409).json({
            error: 'Duplicate URL',
            message: 'A resource with this URL already exists in the database',
            existingResourceId: existingResource.id,
            existingResourceTitle: existingResource.title
          });
        }

        const newResource = await prisma.resource.create({
          data: {
            ...(deckId && { deckId: parseInt(deckId) }),
            type,
            title,
            url,
            author,
            platform,
            accessType: accessType || 'Free',
            publicationDate: publicationDate ? new Date(publicationDate) : null,
            thumbnail,
            decklist,
            status: status || 'approved' // Default to approved if not specified
          },
          include: {
            chapters: true
          }
        });

        return res.status(201).json(newResource);
      }

      case 'PUT': {
        const { id, type, title, url, author, platform, accessType, publicationDate, thumbnail, decklist, status, chapters, deckId } = req.body;

        if (!id || !type || !title || !url) {
          return res.status(400).json({ error: 'ID, type, title, and url are required' });
        }

        // First, delete existing chapters if chapters array is provided
        if (chapters !== undefined) {
          await prisma.chapter.deleteMany({
            where: { resourceId: parseInt(id) }
          });
        }

        const updatedResource = await prisma.resource.update({
          where: { id: parseInt(id) },
          data: {
            type,
            title,
            url,
            author,
            platform,
            accessType: accessType || 'Free',
            publicationDate: publicationDate ? new Date(publicationDate) : null,
            thumbnail,
            decklist,
            status: status || 'approved',
            ...(deckId && { deckId: parseInt(deckId) }),
            // Create new chapters if provided
            ...(chapters && chapters.length > 0 && {
              chapters: {
                create: chapters.map(chapter => ({
                  title: chapter.title || '',
                  timestamp: chapter.timestamp || '',
                  opponentDeck: chapter.opponentDeck || ''
                }))
              }
            })
          },
          include: {
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

        return res.status(200).json(updatedResource);
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: 'Resource ID is required' });
        }

        await prisma.resource.delete({
          where: { id: parseInt(id) }
        });

        return res.status(200).json({ message: 'Resource deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
