const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        // Get chapters for a resource
        if (query.resourceId) {
          const chapters = await prisma.chapter.findMany({
            where: { resourceId: parseInt(query.resourceId) },
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
          });
          return res.json(chapters);
        }

        // Get single chapter by ID
        if (query.id) {
          const chapter = await prisma.chapter.findUnique({
            where: { id: parseInt(query.id) },
            include: {
              opposingDeck: {
                select: {
                  id: true,
                  name: true,
                  icons: true
                }
              }
            }
          });
          return res.json(chapter);
        }

        return res.status(400).json({ error: 'Missing resourceId or id parameter' });

      case 'POST':
        // Create new chapter
        const newChapter = await prisma.chapter.create({
          data: {
            resourceId: body.resourceId,
            timestamp: body.timestamp,
            title: body.title,
            chapterType: body.chapterType,
            opposingDeckId: body.opposingDeckId || null
          },
          include: {
            opposingDeck: {
              select: {
                id: true,
                name: true,
                icons: true
              }
            }
          }
        });
        return res.status(201).json(newChapter);

      case 'PUT':
        // Update chapter
        if (!query.id) {
          return res.status(400).json({ error: 'Missing id parameter' });
        }

        const updatedChapter = await prisma.chapter.update({
          where: { id: parseInt(query.id) },
          data: {
            timestamp: body.timestamp,
            title: body.title,
            chapterType: body.chapterType,
            opposingDeckId: body.opposingDeckId || null
          },
          include: {
            opposingDeck: {
              select: {
                id: true,
                name: true,
                icons: true
              }
            }
          }
        });
        return res.json(updatedChapter);

      case 'DELETE':
        // Delete chapter
        if (!query.id) {
          return res.status(400).json({ error: 'Missing id parameter' });
        }

        await prisma.chapter.delete({
          where: { id: parseInt(query.id) }
        });
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Chapters API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
