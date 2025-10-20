// Simple admin authentication API
// In production, this should use proper password hashing and JWT tokens

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check password
    if (password === ADMIN_PASSWORD) {
      // In production, this would return a JWT token
      // For now, we'll use a simple session token
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

      return res.status(200).json({
        success: true,
        token: token,
        message: 'Authentication successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: error.message
    });
  }
};
