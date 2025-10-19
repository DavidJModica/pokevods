const axios = require('axios');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Scrapes deck data from Limitless TCG
 * Can be adapted to scrape from other sources in the future
 */

const LIMITLESS_DECKS_URL = 'https://play.limitlesstcg.com/decks';

async function scrapeLimitlessDecks() {
  console.log('🔍 Fetching deck data from Limitless TCG...');

  try {
    // Fetch the page
    const response = await axios.get(LIMITLESS_DECKS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const $ = cheerio.load(response.data);
    const decks = [];

    console.log('📄 Page loaded successfully, parsing deck data...');

    // Try multiple selectors to find deck cards/items
    // Adjust these selectors based on the actual HTML structure
    const possibleSelectors = [
      '.deck-card',
      '.deck-item',
      '[class*="deck"]',
      '.card',
      '[data-deck]',
      'article',
      '.archetype'
    ];

    let deckElements = null;
    for (const selector of possibleSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
        deckElements = elements;
        break;
      }
    }

    if (!deckElements || deckElements.length === 0) {
      console.log('⚠️  Could not find deck elements with standard selectors.');
      console.log('📋 Attempting to analyze page structure...');

      // Try to find any links or headings that might contain deck names
      const links = $('a').filter((i, el) => {
        const text = $(el).text().trim();
        return text.length > 0 && text.length < 100;
      });

      const headings = $('h1, h2, h3, h4, h5, h6').filter((i, el) => {
        const text = $(el).text().trim();
        return text.length > 0 && text.length < 100;
      });

      console.log(`Found ${links.length} links and ${headings.length} headings`);

      // Sample some content for debugging
      console.log('\n📝 Sample content from page:');
      links.slice(0, 10).each((i, el) => {
        console.log(`  Link ${i + 1}: ${$(el).text().trim()}`);
      });

      headings.slice(0, 10).each((i, el) => {
        console.log(`  Heading ${i + 1}: ${$(el).text().trim()}`);
      });
    }

    // If we found deck elements, parse them
    if (deckElements && deckElements.length > 0) {
      deckElements.each((index, element) => {
        const $el = $(element);

        // Extract deck name (try multiple approaches)
        const name =
          $el.find('h2, h3, h4, .deck-name, [class*="name"]').first().text().trim() ||
          $el.find('a').first().text().trim() ||
          $el.text().trim().split('\n')[0].trim();

        // Extract archetype/type
        const archetype =
          $el.find('.archetype, [class*="archetype"], [class*="type"]').first().text().trim() ||
          name; // Default to name if no archetype found

        // Extract icon/image URL
        const iconUrl =
          $el.find('img').first().attr('src') ||
          $el.find('[style*="background-image"]').first().css('background-image')?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] ||
          null;

        // Extract format if available
        const format =
          $el.find('.format, [class*="format"]').first().text().trim() ||
          'Standard'; // Default to Standard

        if (name && name.length > 0 && name.length < 100) {
          decks.push({
            name,
            archetype,
            format,
            iconUrl,
            description: null,
            deckList: null
          });
        }
      });
    }

    if (decks.length === 0) {
      console.log('❌ No decks found. The page structure might have changed.');
      console.log('💡 Try visiting the page manually and inspect the HTML structure.');
      return [];
    }

    console.log(`\n✅ Found ${decks.length} decks!`);
    console.log('\n📋 Preview of scraped decks:');
    decks.slice(0, 5).forEach((deck, i) => {
      console.log(`  ${i + 1}. ${deck.name} (${deck.archetype}) - Format: ${deck.format}`);
      if (deck.iconUrl) {
        console.log(`     Icon: ${deck.iconUrl}`);
      }
    });

    return decks;

  } catch (error) {
    console.error('❌ Error scraping Limitless TCG:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
    }
    throw error;
  }
}

async function saveDecksToDB(decks) {
  console.log(`\n💾 Saving ${decks.length} decks to database...`);

  let created = 0;
  let skipped = 0;

  for (const deck of decks) {
    try {
      // Check if deck already exists
      const existing = await prisma.deck.findFirst({
        where: {
          name: deck.name,
          archetype: deck.archetype
        }
      });

      if (existing) {
        console.log(`  ⏭️  Skipped (already exists): ${deck.name}`);
        skipped++;
        continue;
      }

      // Create new deck
      await prisma.deck.create({
        data: {
          name: deck.name,
          archetype: deck.archetype,
          format: deck.format,
          description: deck.description || `${deck.archetype} deck from Limitless TCG`,
          deckList: deck.deckList
        }
      });

      console.log(`  ✅ Created: ${deck.name}`);
      created++;

    } catch (error) {
      console.error(`  ❌ Error saving ${deck.name}:`, error.message);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${decks.length}`);
}

async function clearExistingDecks() {
  console.log('🗑️  Clearing existing decks from database...');

  const deleted = await prisma.deck.deleteMany({});
  console.log(`   Deleted ${deleted.count} decks`);
}

// Main function
async function main() {
  console.log('🎴 PokeVods - Limitless TCG Deck Scraper\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const shouldSave = !args.includes('--dry-run');

  if (shouldClear) {
    await clearExistingDecks();
  }

  // Scrape the decks
  const decks = await scrapeLimitlessDecks();

  if (decks.length === 0) {
    console.log('\n⚠️  No decks were scraped. Exiting without saving.');
    return;
  }

  // Save to database (unless --dry-run)
  if (shouldSave) {
    await saveDecksToDB(decks);
  } else {
    console.log('\n🏃 Dry run mode - not saving to database');
    console.log(`   Found ${decks.length} decks that would be saved`);
  }

  console.log('\n✨ Done!');
}

// Run the script
main()
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
