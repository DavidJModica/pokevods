require('dotenv').config({ path: '.env.production' });
process.env.PRISMA_DATABASE_URL = process.env.DATABASE_URL;
process.env.POSTGRES_URL = process.env.DIRECT_URL;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Matches Metafy guides to decks based on title keywords
 */

async function matchMetafyDecks() {
  console.log('🔍 Matching Metafy guides to decks...\n');

  try {
    // Get all decks
    const decks = await prisma.deck.findMany({
      select: { id: true, name: true }
    });

    // Get all Metafy resources without decks
    const metafyGuides = await prisma.resource.findMany({
      where: {
        platform: 'Metafy',
        deckId: null
      }
    });

    console.log(`Found ${metafyGuides.length} Metafy guides without decks`);
    console.log(`Found ${decks.length} decks to match against\n`);

    let matched = 0;
    let unmatched = 0;

    for (const guide of metafyGuides) {
      // Try to find a matching deck by searching title
      let matchedDeck = null;

      // Create variations of deck names to match
      for (const deck of decks) {
        const deckNameVariations = [
          deck.name.toLowerCase(),
          deck.name.toLowerCase().replace(/\sex\s/g, ' '),
          deck.name.toLowerCase().replace(/\sex$/g, ''),
          deck.name.toLowerCase().replace(/'s /g, ' ')
        ];

        const titleLower = guide.title.toLowerCase();

        // Check if any variation matches
        if (deckNameVariations.some(variation => titleLower.includes(variation))) {
          matchedDeck = deck;
          break;
        }
      }

      if (matchedDeck) {
        // Update the resource with the matched deck
        await prisma.resource.update({
          where: { id: guide.id },
          data: { deckId: matchedDeck.id }
        });

        console.log(`✅ Matched: "${guide.title}" → ${matchedDeck.name}`);
        matched++;
      } else {
        console.log(`❌ No match: "${guide.title}"`);
        unmatched++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Matched: ${matched}`);
    console.log(`   ❌ Unmatched: ${unmatched}`);
    console.log(`   📝 Total: ${metafyGuides.length}`);

  } catch (error) {
    console.error('❌ Error matching decks:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the matcher
matchMetafyDecks()
  .then(() => {
    console.log('\n🎉 Deck matching completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deck matching failed:', error);
    process.exit(1);
  });
