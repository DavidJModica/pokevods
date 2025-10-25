const prisma = require('../lib/prisma');
const { verifyToken } = require('../lib/authMiddleware');

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
        const { id, search, format, archetype } = req.query;

        // Add caching headers for GET requests
        // Cache for 5 minutes for list queries, 10 minutes for single deck
        if (id) {
          res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
        } else {
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        }

        // Get single deck by ID
        if (id) {
          const deck = await prisma.deck.findUnique({
            where: { id: parseInt(id) },
            include: {
              resources: {
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
                orderBy: { createdAt: 'desc' }
              }
            }
          });

          if (!deck) {
            return res.status(404).json({ error: 'Deck not found' });
          }

          return res.status(200).json(deck);
        }

        // Build filter query
        const where = {};

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { archetype: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ];
        }

        if (format) {
          where.format = format;
        }

        if (archetype) {
          where.archetype = { contains: archetype, mode: 'insensitive' };
        }

        // Get all decks (with optional filters)
        const decks = await prisma.deck.findMany({
          where,
          include: {
            resources: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        return res.status(200).json(decks);
      }

      case 'POST': {
        const { name, archetype, format, description, deckList, icon1, icon2 } = req.body;

        if (!name || !archetype || !format) {
          return res.status(400).json({ error: 'Name, archetype, and format are required' });
        }

        // Build icons array from icon1 and icon2
        const icons = [];
        if (icon1) icons.push(icon1);
        if (icon2) icons.push(icon2);

        const newDeck = await prisma.deck.create({
          data: {
            name,
            archetype,
            format,
            description,
            deckList,
            icons: icons.length > 0 ? JSON.stringify(icons) : null
          },
          include: {
            resources: true
          }
        });

        return res.status(201).json(newDeck);
      }

      case 'PUT': {
        const { id, name, archetype, format, description, deckList, icon1, icon2 } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Deck ID is required' });
        }

        // Build update data object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (archetype !== undefined) updateData.archetype = archetype;
        if (format !== undefined) updateData.format = format;
        if (description !== undefined) updateData.description = description;
        if (deckList !== undefined) updateData.deckList = deckList;

        // Handle icons if provided
        if (icon1 !== undefined || icon2 !== undefined) {
          const icons = [];
          if (icon1) icons.push(icon1);
          if (icon2) icons.push(icon2);
          updateData.icons = icons.length > 0 ? JSON.stringify(icons) : null;
        }

        const updatedDeck = await prisma.deck.update({
          where: { id: parseInt(id) },
          data: updateData,
          include: {
            resources: true
          }
        });

        return res.status(200).json(updatedDeck);
      }

      case 'DELETE': {
        // Require admin authentication for deletion
        return verifyToken(req, res, async () => {
          // Only admins can delete
          if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized - admin access required' });
          }

          const { id: deleteId } = req.query;

          if (!deleteId) {
            return res.status(400).json({ error: 'Deck ID is required' });
          }

          await prisma.deck.delete({
            where: { id: parseInt(deleteId) }
          });

          return res.status(200).json({ message: 'Deck deleted successfully' });
        });
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
