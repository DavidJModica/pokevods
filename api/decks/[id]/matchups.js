const prisma = require('../../../lib/prisma');

module.exports = async function handler(req, res) {
  const { method, query } = req;
  const deckId = parseInt(query.id);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the deck to find its name and check if it's a variant
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Find all deck IDs that should be included in the search:
    // 1. The deck itself
    // 2. All its variants (decks where variantOf = this deck's name)
    // 3. If this deck is a variant, also include the parent and all other variants

    let deckIdsToSearch = [deckId];

    // Determine the "base" deck name to search for
    const baseDeckName = deck.variantOf || deck.name;

    // Find all decks that are variants of the base deck, plus the base deck itself
    const relatedDecks = await prisma.deck.findMany({
      where: {
        OR: [
          { name: baseDeckName }, // The base deck
          { variantOf: baseDeckName } // All variants
        ]
      },
      select: { id: true, name: true }
    });

    deckIdsToSearch = relatedDecks.map(d => d.id);

    // Find all matchup chapters where the opposing deck is any of these related decks
    const matchupChapters = await prisma.chapter.findMany({
      where: {
        chapterType: 'Matchup',
        opposingDeckId: {
          in: deckIdsToSearch
        }
      },
      include: {
        resource: {
          include: {
            deck: {
              select: {
                id: true,
                name: true,
                icons: true
              }
            },
            authorProfile: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        opposingDeck: {
          select: {
            id: true,
            name: true,
            icons: true
          }
        }
      },
      orderBy: [
        { resource: { publicationDate: 'desc' } }
      ]
    });

    // Group chapters by the deck they're from (resource.deck)
    const groupedByDeck = {};
    matchupChapters.forEach(chapter => {
      if (!chapter.resource.deck) return; // Skip if no deck associated

      const deckName = chapter.resource.deck.name;
      if (!groupedByDeck[deckName]) {
        groupedByDeck[deckName] = {
          deck: chapter.resource.deck,
          chapters: []
        };
      }
      groupedByDeck[deckName].chapters.push(chapter);
    });

    return res.status(200).json({
      baseDeck: baseDeckName,
      relatedDecks: relatedDecks,
      totalChapters: matchupChapters.length,
      chapters: matchupChapters,
      groupedByDeck: Object.values(groupedByDeck)
    });

  } catch (error) {
    console.error('Error fetching deck matchups:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
