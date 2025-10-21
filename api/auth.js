// Admin authentication API with JWT
const bcrypt = require('bcryptjs');
const { generateToken } = require('../lib/authMiddleware');
const { checkRateLimit, recordSuccessfulLogin } = require('../lib/rateLimiter');

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!ADMIN_PASSWORD_HASH) {
  throw new Error(
    'CRITICAL SECURITY ERROR: ADMIN_PASSWORD_HASH environment variable is not set.\n' +
    'This is required for admin authentication.\n' +
    'Generate a bcrypt hash of your password and set it in your .env file.\n' +
    'You can generate a hash by running: node -e "const bcrypt = require(\'bcryptjs\'); bcrypt.hash(\'YOUR_PASSWORD\', 10).then(console.log);"'
  );
}

// Validate that the hash looks like a bcrypt hash
if (!ADMIN_PASSWORD_HASH.startsWith('$2a$') && !ADMIN_PASSWORD_HASH.startsWith('$2b$')) {
  throw new Error(
    'CRITICAL SECURITY ERROR: ADMIN_PASSWORD_HASH does not appear to be a valid bcrypt hash.\n' +
    'It should start with $2a$ or $2b$.\n' +
    'Generate a proper hash by running: node -e "const bcrypt = require(\'bcryptjs\'); bcrypt.hash(\'YOUR_PASSWORD\', 10).then(console.log);"'
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

  // Check rate limit
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Compare password with bcrypt hash
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (isValid) {
      // Reset rate limit on successful login
      recordSuccessfulLogin(req);

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
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));

      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
