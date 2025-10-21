// Admin authentication API with JWT
const { generateToken } = require('../lib/authMiddleware');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error(
    'CRITICAL SECURITY ERROR: ADMIN_PASSWORD environment variable is not set.\n' +
    'This is required for admin authentication.\n' +
    'Set a strong password (minimum 12 characters) in your .env file before starting the server.'
  );
}

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
      // Generate JWT token with 24 hour expiration
      const token = generateToken({
        role: 'admin',
        loginTime: new Date().toISOString()
      }, '24h');

      return res.status(200).json({
        success: true,
        token: token,
        expiresIn: '24h',
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
