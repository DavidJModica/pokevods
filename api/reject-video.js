const prisma = require('../lib/prisma');

module.exports = async function handler(req, res) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resourceId, reason } = req.body;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    // Get the resource details before deleting
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(resourceId) },
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
    await prisma.rejectedVideo.upsert({
      where: { url: resource.url },
      update: {
        title: resource.title,
        reason: reason || 'Rejected by admin'
      },
      create: {
        url: resource.url,
        title: resource.title,
        reason: reason || 'Rejected by admin'
      }
    });

    // Delete the resource
    await prisma.resource.delete({
      where: { id: parseInt(resourceId) }
    });

    return res.status(200).json({
      success: true,
      message: 'Video rejected and will not be re-added in future scans'
    });

  } catch (error) {
    console.error('Error rejecting video:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
