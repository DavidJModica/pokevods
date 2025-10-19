const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Scrapes deck data from Limitless TCG using Puppeteer (headless browser)
 * Handles JavaScript-rendered content
 */

const LIMITLESS_DECKS_URL = 'https://play.limitlesstcg.com/decks';

async function scrapeLimitlessDecksWithBrowser() {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('🔍 Navigating to Limitless TCG...');
    await page.goto(LIMITLESS_DECKS_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Waiting for content to load...');

    // Wait a bit for JavaScript to render content
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📸 Taking screenshot for debugging...');
    await page.screenshot({ path: 'limitless-debug.png', fullPage: true });

    console.log('📄 Extracting deck data from page...');

    // Extract deck data using page.evaluate (runs in browser context)
    const decks = await page.evaluate(() => {
      const results = [];

      // Try to find deck elements using various selectors
      const selectors = [
        '[class*="deck"]',
        '[class*="card"]',
        '[class*="archetype"]',
        'a[href*="/deck"]',
        'article',
        '.grid > div',
        '[data-deck]'
      ];

      let deckElements = [];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          deckElements = Array.from(elements);
          break;
        }
      }

      // If still nothing found, try to extract any structured data
      if (deckElements.length === 0) {
        // Look for any grid or list structures
        const grids = document.querySelectorAll('[class*="grid"], [class*="list"], ul, .container > div');
        for (const grid of grids) {
          const children = grid.children;
          if (children.length > 5) { // Probably a deck list
            deckElements = Array.from(children);
            console.log(`Found potential deck list with ${children.length} items`);
            break;
          }
        }
      }

      // Extract data from elements
      deckElements.forEach((el, index) => {
        try {
          // Try to find deck name
          const nameEl = el.querySelector('h1, h2, h3, h4, h5, h6, [class*="name"], [class*="title"]');
          const name = nameEl ? nameEl.textContent.trim() : el.textContent.trim().split('\n')[0].trim();

          // Try to find image/icon
          const img = el.querySelector('img');
          const iconUrl = img ? img.src : null;

          // Try to find archetype
          const archetypeEl = el.querySelector('[class*="archetype"], [class*="type"]');
          const archetype = archetypeEl ? archetypeEl.textContent.trim() : name;

          // Try to find format
          const formatEl = el.querySelector('[class*="format"]');
          const format = formatEl ? formatEl.textContent.trim() : 'Standard';

          if (name && name.length > 0 && name.length < 200) {
            results.push({
              name,
              archetype,
              format,
              iconUrl
            });
          }
        } catch (err) {
          console.error(`Error parsing element ${index}:`, err.message);
        }
      });

      // Also try to extract from any visible text that looks like deck names
      if (results.length === 0) {
        const allText = document.body.textContent;
        const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.length < 100);
        console.log(`Found ${lines.length} text lines, first 20:`, lines.slice(0, 20));
      }

      return results;
    });

    console.log(`\n✅ Extracted ${decks.length} decks from browser`);

    if (decks.length > 0) {
      console.log('\n📋 Preview of scraped decks:');
      decks.slice(0, 10).forEach((deck, i) => {
        console.log(`  ${i + 1}. ${deck.name}`);
        console.log(`     Archetype: ${deck.archetype}`);
        console.log(`     Format: ${deck.format}`);
        if (deck.iconUrl) {
          console.log(`     Icon: ${deck.iconUrl}`);
        }
      });
    } else {
      console.log('\n⚠️  No decks found. Check the screenshot (limitless-debug.png) to see what the page looks like.');
    }

    return decks;

  } catch (error) {
    console.error('❌ Error scraping with browser:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
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
          OR: [
            { name: deck.name },
            { archetype: deck.archetype }
          ]
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
          format: deck.format || 'Standard',
          description: `${deck.archetype} deck archetype`,
          deckList: null
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
  console.log(`   Deleted ${deleted.count} decks\n`);
}

// Main function
async function main() {
  console.log('🎴 PokeVods - Limitless TCG Deck Scraper (Browser Mode)\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const shouldSave = !args.includes('--dry-run');

  if (shouldClear) {
    await clearExistingDecks();
  }

  // Scrape the decks
  const decks = await scrapeLimitlessDecksWithBrowser();

  if (decks.length === 0) {
    console.log('\n⚠️  No decks were scraped. Check limitless-debug.png to debug.');
    console.log('💡 The page might require login or have anti-bot protection.');
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
