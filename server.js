const express = require('express');
const cors = require('cors');
const path = require('path');

const decksHandler = require('./api/decks');
const resourcesHandler = require('./api/resources');
const chaptersHandler = require('./api/chapters');
const youtubeHandler = require('./api/youtube');
const bulkImportHandler = require('./api/bulk-import');
const authorsHandler = require('./api/authors');
const { verifyToken } = require('./lib/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Protect POST/PUT/DELETE methods with authentication
function protectMutatingMethods(handler) {
  return async (req, res) => {
    const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    if (mutatingMethods.includes(req.method)) {
      // Require authentication for data-changing operations
      return verifyToken(req, res, async () => {
        try {
          await handler(req, res);
        } catch (error) {
          console.error('Protected endpoint error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
          }
        }
      });
    }

    // Allow GET/OPTIONS without authentication
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Public endpoint error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

// API Routes - protect mutating methods with authentication
app.all('/api/decks', protectMutatingMethods(decksHandler));

app.get('/api/resources/matchup-queue', async (req, res) => {
  try {
    console.log('🔍 Matchup queue endpoint called');
    const prisma = require('./lib/prisma');
    console.log('📦 Prisma client loaded');
    // Find approved resources where:
    // 1. At least one chapter has chapterType='Matchup' but opposingDeckId is null, OR
    // 2. Type contains "Gameplay" but has no matchup chapters at all
    const resources = await prisma.resource.findMany({
      where: {
        status: 'approved',
        OR: [
          {
            // Has matchup chapters missing opponent deck
            chapters: {
              some: {
                chapterType: 'Matchup',
                opposingDeckId: null
              }
            }
          },
          {
            // Is Gameplay type but has no matchup chapters
            type: {
              contains: 'Gameplay'
            },
            chapters: {
              none: {
                chapterType: 'Matchup'
              }
            }
          }
        ]
      },
      include: {
        deck: {
          select: {
            id: true,
            name: true,
            icons: true
          }
        },
        chapters: {
          include: {
            opposingDeck: {
              select: {
                id: true,
                name: true,
                icons: true
              }
            }
          },
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Matchup queue query returned ${resources.length} resources`);
    res.status(200).json(resources);
  } catch (error) {
    console.error('❌ Matchup queue API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.all('/api/resources', protectMutatingMethods(resourcesHandler));

app.all('/api/chapters', protectMutatingMethods(chaptersHandler));

app.all('/api/youtube', protectMutatingMethods(youtubeHandler));

app.all('/api/bulk-import', protectMutatingMethods(bulkImportHandler));

app.all('/api/authors', protectMutatingMethods(authorsHandler));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🎴 PokeVods API server running on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite (pokevods.db)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
