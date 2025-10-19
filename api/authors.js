const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { slug, id } = req.query;

        // Get single author by slug or id
        if (slug || id) {
          const author = await prisma.author.findUnique({
            where: slug ? { slug } : { id: parseInt(id) },
            include: {
              resources: {
                where: { status: 'approved' },
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
                orderBy: { publicationDate: 'desc' }
              }
            }
          });
          return res.status(200).json(author);
        }

        // Get all authors
        const authors = await prisma.author.findMany({
          include: {
            _count: {
              select: { resources: true }
            }
          },
          orderBy: { name: 'asc' }
        });

        return res.status(200).json(authors);
      }

      case 'POST': {
        const { name, bio, youtube, twitter, twitch, discord, website } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        // Create slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const newAuthor = await prisma.author.create({
          data: {
            name,
            slug,
            bio,
            youtube,
            twitter,
            twitch,
            discord,
            website
          }
        });

        return res.status(201).json(newAuthor);
      }

      case 'PUT': {
        const { id, name, bio, youtube, twitter, twitch, discord, website } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID is required' });
        }

        // Update slug if name changed
        let slug;
        if (name) {
          slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        const updatedAuthor = await prisma.author.update({
          where: { id: parseInt(id) },
          data: {
            ...(name && { name, slug }),
            ...(bio !== undefined && { bio }),
            ...(youtube !== undefined && { youtube }),
            ...(twitter !== undefined && { twitter }),
            ...(twitch !== undefined && { twitch }),
            ...(discord !== undefined && { discord }),
            ...(website !== undefined && { website })
          }
        });

        return res.status(200).json(updatedAuthor);
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ error: 'Author ID is required' });
        }

        await prisma.author.delete({
          where: { id: parseInt(id) }
        });

        return res.status(200).json({ message: 'Author deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Authors API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
