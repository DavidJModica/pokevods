const express = require('express');
const cors = require('cors');
const path = require('path');

const decksHandler = require('./api/decks');
const resourcesHandler = require('./api/resources');
const chaptersHandler = require('./api/chapters');
const youtubeHandler = require('./api/youtube');
const bulkImportHandler = require('./api/bulk-import');
const authorsHandler = require('./api/authors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - wrap handlers properly
app.all('/api/decks', async (req, res) => {
  try {
    await decksHandler(req, res);
  } catch (error) {
    console.error('Decks API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.get('/api/resources/matchup-queue', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    // Find approved resources where at least one chapter has chapterType='Matchup' but opposingDeckId is null
    const resources = await prisma.resource.findMany({
      where: {
        status: 'approved',
        chapters: {
          some: {
            chapterType: 'Matchup',
            opposingDeckId: null
          }
        }
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
    res.status(200).json(resources);
  } catch (error) {
    console.error('Matchup queue API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.all('/api/resources', async (req, res) => {
  try {
    await resourcesHandler(req, res);
  } catch (error) {
    console.error('Resources API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.all('/api/chapters', async (req, res) => {
  try {
    await chaptersHandler(req, res);
  } catch (error) {
    console.error('Chapters API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.all('/api/youtube', async (req, res) => {
  try {
    await youtubeHandler(req, res);
  } catch (error) {
    console.error('YouTube API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.all('/api/bulk-import', async (req, res) => {
  try {
    await bulkImportHandler(req, res);
  } catch (error) {
    console.error('Bulk import API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.all('/api/authors', async (req, res) => {
  try {
    await authorsHandler(req, res);
  } catch (error) {
    console.error('Authors API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

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
