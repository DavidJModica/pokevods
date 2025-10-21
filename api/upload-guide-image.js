// Image upload API for hosted guides using Vercel Blob
const { put } = require('@vercel/blob');
const { verifyAuthorOrAdmin } = require('../lib/authorMiddleware');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
  return verifyAuthorOrAdmin(req, res, async () => {
    try {
      const { image, fileName } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      if (!fileName) {
        return res.status(400).json({ error: 'No file name provided' });
      }

      // Validate image is base64
      if (!image.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format. Must be base64 data URL' });
      }

      // Extract base64 data
      const base64Data = image.split(',')[1];
      if (!base64Data) {
        return res.status(400).json({ error: 'Invalid image data' });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (buffer.length > maxSize) {
        return res.status(400).json({ error: 'Image too large. Maximum size is 10MB' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `guides/${timestamp}-${sanitizedFileName}`;

      // Upload to Vercel Blob
      const blob = await put(uniqueFileName, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: image.match(/data:image\/([a-zA-Z]*);/)[0].replace('data:', '').replace(';', '')
      });

      return res.status(200).json({
        success: true,
        url: blob.url,
        size: blob.size
      });

    } catch (error) {
      console.error('Image upload error:', error);
      return res.status(500).json({
        success: false,
        error: 'Image upload failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};
