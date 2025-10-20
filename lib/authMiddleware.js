const jwt = require('jsonwebtoken');

// Secret key for JWT - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'pokevods-secret-key-change-in-production';

/**
 * Middleware to verify JWT token from Authorization header
 * Usage: Add this to any admin-only API routes
 */
function verifyToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    // Token format: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request object
    req.user = decoded;

    // Continue to next middleware/handler
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  }
}

/**
 * Generate a new JWT token
 * @param {object} payload - Data to encode in the token
 * @param {string} expiresIn - Token expiration time (e.g., '24h', '7d')
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token without middleware
 * @param {string} token - Token to verify
 * @returns {object|null} Decoded payload or null if invalid
 */
function verifyTokenSync(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  verifyToken,
  generateToken,
  verifyTokenSync,
  JWT_SECRET
};
