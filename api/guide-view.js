// Increment view count for a hosted guide
const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    await prisma.resource.updateMany({
      where: {
        slug,
        isHosted: true
      },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('View increment error:', error);
    return res.status(500).json({ error: 'Failed to increment view count' });
  }
};
