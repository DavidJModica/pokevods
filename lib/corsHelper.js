/**
 * CORS Helper - Secure CORS configuration for API endpoints
 *
 * This replaces the dangerous wildcard (*) CORS that allows any website
 * to make requests to our API.
 */

// Get allowed origins from environment variable
// Format: comma-separated list, e.g., "https://pokevods.com,https://www.pokevods.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());

/**
 * Set secure CORS headers based on request origin
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  // Check if the origin is in our allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (ALLOWED_ORIGINS.includes('*')) {
    // Only use wildcard if explicitly configured (not recommended for production)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (ALLOWED_ORIGINS.length > 0) {
    // Use first allowed origin as fallback
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * Handle CORS preflight requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {boolean} - True if this was a preflight request
 */
function handleCorsPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}

module.exports = {
  setCorsHeaders,
  handleCorsPreflight,
  ALLOWED_ORIGINS
};
