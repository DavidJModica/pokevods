// Hosted Guides API - CRUD operations for guide resources
const prisma = require('../lib/prisma');
const { verifyToken } = require('../lib/authMiddleware');
const { verifyAuthorOrAdmin } = require('../lib/authorMiddleware');

// Helper to generate URL-friendly slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = async function handler(req, res) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET': {
        const { slug, id, status } = req.query;

        // Cache headers for public views
        if (slug && !status) {
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        }

        if (slug) {
          // Get guide by slug (public view)
          const guide = await prisma.resource.findFirst({
            where: {
              slug,
              isHosted: true,
              publishStatus: status || 'published' // Default to published for public
            },
            include: {
              deck: {
                select: {
                  id: true,
                  name: true,
                  icons: true,
                  archetype: true,
                  format: true
                }
              },
              authorProfile: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  bio: true,
                  profilePicture: true,
                  youtube: true,
                  twitter: true,
                  twitch: true
                }
              },
              guideSections: {
                include: {
                  images: {
                    orderBy: { order: 'asc' }
                  },
                  matchups: {
                    include: {
                      opposingDeck: {
                        select: {
                          id: true,
                          name: true,
                          icons: true
                        }
                      }
                    },
                    orderBy: { order: 'asc' }
                  }
                },
                orderBy: { order: 'asc' }
              }
            }
          });

          if (!guide) {
            return res.status(404).json({ error: 'Guide not found' });
          }

          return res.status(200).json(guide);
        }

        if (id) {
          // Get guide by ID (for editing)
          const guide = await prisma.resource.findUnique({
            where: { id: parseInt(id) },
            include: {
              deck: true,
              authorProfile: true,
              guideSections: {
                include: {
                  images: {
                    orderBy: { order: 'asc' }
                  },
                  matchups: {
                    include: {
                      opposingDeck: true
                    },
                    orderBy: { order: 'asc' }
                  }
                },
                orderBy: { order: 'asc' }
              }
            }
          });

          if (!guide) {
            return res.status(404).json({ error: 'Guide not found' });
          }

          return res.status(200).json(guide);
        }

        // List all guides
        const where = {
          isHosted: true
        };

        // Filter by status if provided (for admin/author views)
        if (status) {
          where.publishStatus = status;
        } else {
          // Public view - only published
          where.publishStatus = 'published';
        }

        const guides = await prisma.resource.findMany({
          where,
          include: {
            deck: {
              select: {
                id: true,
                name: true,
                icons: true,
                archetype: true
              }
            },
            authorProfile: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            }
          },
          orderBy: { publicationDate: 'desc' }
        });

        return res.status(200).json(guides);
      }

      case 'POST': {
        // Create new hosted guide (requires author/admin auth)
        return verifyAuthorOrAdmin(req, res, async () => {
          const { title, deckId, thumbnail, sections } = req.body;

          if (!title) {
            return res.status(400).json({ error: 'Title is required' });
          }

          if (!deckId) {
            return res.status(400).json({ error: 'Deck is required' });
          }

          if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({ error: 'Sections array is required' });
          }

          const slug = generateSlug(title);
          const authorId = req.user.authorId || req.user.userId;

          // Check for slug conflicts
          const existing = await prisma.resource.findUnique({
            where: { slug }
          });

          const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

          // Create resource with sections
          const guide = await prisma.resource.create({
            data: {
              type: 'Hosted Guide',
              title,
              slug: finalSlug,
              deckId,
              authorId,
              thumbnail,
              isHosted: true,
              platform: 'PokeVods Hosted',
              publishStatus: 'draft',
              publicationDate: new Date(),
              status: 'approved',
              lastEditedBy: authorId,
              guideSections: {
                create: sections.map(section => {
                  const sectionData = {
                    sectionType: section.type,
                    title: section.title,
                    content: section.content || '',
                    order: section.order
                  };

                  // Add matchups if this is a matchups section
                  if (section.matchups && section.matchups.length > 0) {
                    sectionData.matchups = {
                      create: section.matchups.map((m, i) => ({
                        opposingDeckId: m.opposingDeckId,
                        winPercentage: m.winPercentage,
                        difficulty: m.difficulty,
                        notes: m.notes,
                        keyCards: m.keyCards || [],
                        order: i + 1
                      }))
                    };
                  }

                  return sectionData;
                })
              }
            },
            include: {
              guideSections: {
                include: {
                  matchups: true
                },
                orderBy: { order: 'asc' }
              }
            }
          });

          return res.status(201).json({ success: true, guide });
        });
      }

      case 'PUT': {
        // Update hosted guide
        return verifyAuthorOrAdmin(req, res, async () => {
          const { id, title, deckId, thumbnail, sections, publishStatus } = req.body;

          if (!id) {
            return res.status(400).json({ error: 'Guide ID is required' });
          }

          const guideId = parseInt(id);

          // Check if guide exists
          const existing = await prisma.resource.findUnique({
            where: { id: guideId }
          });

          if (!existing) {
            return res.status(404).json({ error: 'Guide not found' });
          }

          // Delete existing sections and recreate
          await prisma.guideSection.deleteMany({
            where: { resourceId: guideId }
          });

          const slug = title ? generateSlug(title) : existing.slug;

          // Check for slug conflicts (excluding current guide)
          if (title && slug !== existing.slug) {
            const conflict = await prisma.resource.findFirst({
              where: {
                slug,
                id: { not: guideId }
              }
            });

            if (conflict) {
              return res.status(400).json({ error: 'A guide with this title already exists' });
            }
          }

          const authorId = req.user.authorId || req.user.userId;

          // Update resource
          const guide = await prisma.resource.update({
            where: { id: guideId },
            data: {
              title: title || existing.title,
              slug: title ? slug : existing.slug,
              deckId: deckId || existing.deckId,
              thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
              publishStatus: publishStatus || existing.publishStatus,
              publicationDate: publishStatus === 'published' && existing.publishStatus === 'draft'
                ? new Date()
                : existing.publicationDate,
              lastEditedBy: authorId,
              guideSections: sections ? {
                create: sections.map(section => {
                  const sectionData = {
                    sectionType: section.type,
                    title: section.title,
                    content: section.content || '',
                    order: section.order
                  };

                  if (section.matchups && section.matchups.length > 0) {
                    sectionData.matchups = {
                      create: section.matchups.map((m, i) => ({
                        opposingDeckId: m.opposingDeckId,
                        winPercentage: m.winPercentage,
                        difficulty: m.difficulty,
                        notes: m.notes,
                        keyCards: m.keyCards || [],
                        order: i + 1
                      }))
                    };
                  }

                  return sectionData;
                })
              } : undefined
            },
            include: {
              guideSections: {
                include: {
                  matchups: true
                },
                orderBy: { order: 'asc' }
              }
            }
          });

          return res.status(200).json({ success: true, guide });
        });
      }

      case 'DELETE': {
        // Delete hosted guide
        return verifyToken(req, res, async () => {
          const { id } = req.query;

          if (!id) {
            return res.status(400).json({ error: 'Guide ID is required' });
          }

          await prisma.resource.delete({
            where: {
              id: parseInt(id),
              isHosted: true
            }
          });

          return res.status(200).json({ success: true });
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Hosted guides API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
