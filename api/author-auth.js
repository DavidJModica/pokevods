// Author authentication API
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateAuthorToken } = require('../lib/authorMiddleware');
const { checkRateLimit, recordSuccessfulLogin } = require('../lib/rateLimiter');

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

  const { action } = req.body;

  try {
    switch (action) {
      case 'login': {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find author by email
        const author = await prisma.author.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (!author || !author.password) {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
          });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, author.password);

        if (!isValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
          });
        }

        // Generate token
        const token = generateAuthorToken(author, '7d');

        return res.status(200).json({
          success: true,
          token,
          author: {
            id: author.id,
            name: author.name,
            email: author.email,
            canCreateGuides: author.canCreateGuides,
            profilePicture: author.profilePicture
          },
          expiresIn: '7d',
          message: 'Login successful'
        });
      }

      case 'register': {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
          return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Validate password strength
        if (password.length < 8) {
          return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check if author with email already exists
        const existing = await prisma.author.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existing) {
          return res.status(400).json({ error: 'An author with this email already exists' });
        }

        // Generate slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // Check if slug already exists
        const existingSlug = await prisma.author.findUnique({
          where: { slug }
        });

        const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create author (canCreateGuides defaults to false - admin must grant permission)
        const author = await prisma.author.create({
          data: {
            name,
            slug: finalSlug,
            email: email.toLowerCase(),
            password: hashedPassword,
            canCreateGuides: false, // Must be granted by admin
            isVerified: false
          }
        });

        // Generate token
        const token = generateAuthorToken(author, '7d');

        return res.status(201).json({
          success: true,
          token,
          author: {
            id: author.id,
            name: author.name,
            email: author.email,
            canCreateGuides: author.canCreateGuides,
            profilePicture: author.profilePicture
          },
          message: 'Registration successful. An admin must grant guide creation permissions.'
        });
      }

      case 'verify': {
        // Verify token and return current author info
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

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'author') {
          return res.status(403).json({
            success: false,
            error: 'Invalid token type'
          });
        }

        // Get fresh author data
        const author = await prisma.author.findUnique({
          where: { id: decoded.authorId }
        });

        if (!author) {
          return res.status(404).json({
            success: false,
            error: 'Author not found'
          });
        }

        return res.status(200).json({
          success: true,
          author: {
            id: author.id,
            name: author.name,
            email: author.email,
            canCreateGuides: author.canCreateGuides,
            profilePicture: author.profilePicture
          }
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Must be "login", "register", or "verify"' });
    }

  } catch (error) {
    console.error('Author auth error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
