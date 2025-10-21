const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set.\n' +
    'This is required for authentication security.'
  );
}

/**
 * Middleware to verify that the user is either an admin OR an author with guide creation permissions
 * Usage: Wrap guide creation/editing endpoints with this middleware
 */
function verifyAuthorOrAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);

    // Allow admin or author with canCreateGuides permission
    if (decoded.role === 'admin' || (decoded.role === 'author' && decoded.canCreateGuides)) {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to create guides'
      });
    }

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
 * Generate JWT token for author login
 */
function generateAuthorToken(authorData, expiresIn = '7d') {
  return jwt.sign({
    role: 'author',
    authorId: authorData.id,
    name: authorData.name,
    canCreateGuides: authorData.canCreateGuides
  }, JWT_SECRET, { expiresIn });
}

module.exports = {
  verifyAuthorOrAdmin,
  generateAuthorToken
};
