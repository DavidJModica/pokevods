const prisma = require('../lib/prisma');
const { verifyToken } = require('../lib/authMiddleware');
const { setCorsHeaders, handleCorsPreflight } = require('../lib/corsHelper');
const { validateId, validateIds, validateString, validateUrl } = require('../lib/validation');

module.exports = async function handler(req, res) {
  const { method } = req;

  // Set secure CORS headers
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflight(req, res)) {
    return;
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

        // Get pending resources (for review queue) - ADMIN ONLY
        if (status === 'pending') {
          // Require authentication to view pending resources
          return verifyToken(req, res, async () => {
            // Only admins can view pending resources
            if (req.user.role !== 'admin') {
              return res.status(403).json({ error: 'Unauthorized - admin access required to view pending resources' });
            }

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
          });
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

        // If author name is provided, find or create Author record
        let authorId = null;
        if (author && author.trim()) {
          const authorName = author.trim();

          // Try to find existing author (case-insensitive)
          let authorRecord = await prisma.author.findFirst({
            where: {
              name: {
                equals: authorName,
                mode: 'insensitive'
              }
            }
          });

          // If author doesn't exist, create new one
          if (!authorRecord) {
            // Generate slug from name (lowercase, replace spaces with hyphens)
            const slug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            authorRecord = await prisma.author.create({
              data: {
                name: authorName,
                slug: slug
              }
            });
          }

          authorId = authorRecord.id;
        }

        const newResource = await prisma.resource.create({
          data: {
            ...(deckId && { deckId: parseInt(deckId) }),
            type,
            title,
            url,
            author, // Keep legacy field for backward compatibility
            ...(authorId && { authorId }), // Link to Author record
            platform,
            accessType: accessType || 'Free',
            publicationDate: publicationDate ? new Date(publicationDate) : null,
            thumbnail,
            decklist,
            status: status || 'approved' // Default to approved if not specified
          },
          include: {
            chapters: true,
            authorProfile: true
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
                  chapterType: chapter.chapterType || 'Guide',
                  opposingDeckId: chapter.opposingDeckId ? parseInt(chapter.opposingDeckId) : null
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
        // Require admin authentication for deletion
        return verifyToken(req, res, async () => {
          // Only admins can delete
          if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized - admin access required' });
          }

          const { id } = req.query;

          // Validate ID
          let resourceId;
          try {
            resourceId = validateId(id, 'Resource ID');
          } catch (error) {
            return res.status(400).json({ error: error.message });
          }

          // Get the resource details before deleting
          const resource = await prisma.resource.findUnique({
          where: { id: resourceId },
          select: {
            id: true,
            url: true,
            title: true
          }
        });

        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }

        // Add to rejected videos table (upsert in case it already exists)
        // This prevents the scanner from re-adding this video in future scans
        try {
          await prisma.rejectedVideo.upsert({
            where: { url: resource.url },
            update: {
              title: resource.title,
              reason: 'Rejected by admin'
            },
            create: {
              url: resource.url,
              title: resource.title,
              reason: 'Rejected by admin'
            }
          });
        } catch (rejectError) {
          console.error('Failed to add to rejected videos:', rejectError.message);
          // Continue with deletion even if reject tracking fails
        }

          // Delete the resource
          await prisma.resource.delete({
            where: { id: resourceId }
          });

          return res.status(200).json({
            message: 'Resource deleted and will not be re-added in future scans'
          });
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
