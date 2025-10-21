// Simple in-memory rate limiter for authentication endpoints
// Prevents brute force attacks by limiting login attempts per IP

const loginAttempts = new Map(); // Map of IP -> { count, resetTime }

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Max login attempts per window

function getClientIp(req) {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const attemptData = loginAttempts.get(ip);

  if (!attemptData) {
    // First attempt from this IP
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Check if window has expired
  if (now > attemptData.resetTime) {
    // Reset the window
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Increment attempt count
  attemptData.count += 1;

  if (attemptData.count > MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((attemptData.resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - attemptData.count
  };
}

function recordSuccessfulLogin(req) {
  const ip = getClientIp(req);
  // Reset attempts on successful login
  loginAttempts.delete(ip);
}

// Clean up old entries every hour to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now > data.resetTime) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

module.exports = {
  checkRateLimit,
  recordSuccessfulLogin
};
