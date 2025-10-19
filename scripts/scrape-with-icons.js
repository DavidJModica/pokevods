const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

const LIMITLESS_DECKS_URL = 'https://play.limitlesstcg.com/decks';
const ICON_DIR = path.join(__dirname, '..', 'public', 'images', 'deck-icons');

/**
 * Download an image from URL and save it locally
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = require('fs').createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      require('fs').unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });

    file.on('error', (err) => {
      require('fs').unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Generate a safe filename from deck name
 */
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Check if a string is likely a valid deck name
 */
function isValidDeckName(text) {
  if (!text || text.length < 3 || text.length > 100) return false;

  // Filter out common non-deck text
  const invalidPatterns = [
    /^\d+$/,                    // Pure numbers
    /^[\d\s-]+$/,              // Numbers with spaces/dashes (deck codes)
    /^\d+\.\d+%$/,             // Percentages
    /^(help|login|docs|home|decks?|format|count|name)$/i,  // Navigation/headers
    /^(pokemon|one piece|pocket|digimon)/i,       // Generic terms
    /^\d+ - \d+ - \d+$/,       // Stats format
    /^view all$/i,
    /^tournament/i,
    /^card database$/i,
    /mega evolution|black bolt|white flare|destined rivals|journey together/i, // Set names
    /pokémon tcg.*one piece.*digimon/i  // Combined navigation text
  ];

  return !invalidPatterns.some(pattern => pattern.test(text));
}

async function scrapeLimitlessDecksWithIcons() {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('🔍 Navigating to Limitless TCG...');
    await page.goto(LIMITLESS_DECKS_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('⏳ Waiting for content to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📸 Taking screenshot for debugging...');
    await page.screenshot({ path: 'limitless-debug.png', fullPage: true });

    console.log('📄 Extracting deck data with icons...');

    const decks = await page.evaluate(() => {
      const results = [];

      // Look for deck rows/cards - try multiple approaches
      const possibleContainers = [
        document.querySelector('[class*="table"]'),
        document.querySelector('[class*="grid"]'),
        document.querySelector('[class*="list"]'),
        document.querySelector('main'),
        document.body
      ].filter(Boolean);

      let deckElements = [];

      // Try to find repeating elements that likely represent decks
      for (const container of possibleContainers) {
        // Look for rows with multiple cells
        const rows = Array.from(container.querySelectorAll('tr, [class*="row"]'));

        if (rows.length > 10) { // Likely a table of decks
          deckElements = rows;
          console.log(`Found ${rows.length} table rows`);
          break;
        }
      }

      // If no rows found, try card-based layout
      if (deckElements.length === 0) {
        const cards = document.querySelectorAll('[class*="card"], [class*="item"]');
        if (cards.length > 5) {
          deckElements = Array.from(cards);
          console.log(`Found ${cards.length} cards`);
        }
      }

      deckElements.forEach((el, index) => {
        try {
          // Find all images in this element
          const images = Array.from(el.querySelectorAll('img'));

          // Find all text content
          const textElements = Array.from(el.querySelectorAll('*'))
            .map(e => e.textContent?.trim())
            .filter(t => t && t.length > 0);

          // Look for deck name (usually the longest meaningful text or in a heading)
          const heading = el.querySelector('h1, h2, h3, h4, a');
          let deckName = heading?.textContent?.trim();

          // If no heading, look for the first meaningful text
          if (!deckName || deckName.length < 3) {
            deckName = textElements.find(t =>
              t.length >= 5 &&
              t.length <= 100 &&
              !/^\d+$/.test(t) &&
              !/^\d+\.\d+%$/.test(t)
            );
          }

          // Get icon URLs from images
          const iconUrls = images
            .map(img => img.src || img.dataset.src)
            .filter(src => src && !src.includes('logo') && !src.includes('banner'));

          if (deckName) {
            results.push({
              name: deckName,
              iconUrls: iconUrls,
              // Store raw element info for debugging
              _debug: {
                textContent: textElements.slice(0, 5),
                imageCount: images.length
              }
            });
          }
        } catch (err) {
          console.error(`Error parsing element ${index}:`, err.message);
        }
      });

      return results;
    });

    console.log(`\n✅ Extracted ${decks.length} potential decks from browser`);

    // Filter to valid deck names
    const validDecks = decks.filter(deck => isValidDeckName(deck.name));

    console.log(`✅ Filtered to ${validDecks.length} valid decks`);

    if (validDecks.length > 0) {
      console.log('\n📋 Preview of decks with icons:');
      validDecks.slice(0, 15).forEach((deck, i) => {
        console.log(`  ${i + 1}. ${deck.name}`);
        if (deck.iconUrls && deck.iconUrls.length > 0) {
          console.log(`     Icons: ${deck.iconUrls.length} found`);
          deck.iconUrls.slice(0, 2).forEach(url => {
            console.log(`       - ${url.substring(0, 80)}...`);
          });
        } else {
          console.log(`     Icons: None`);
        }
      });
    }

    return validDecks;

  } catch (error) {
    console.error('❌ Error scraping with browser:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

async function downloadDeckIcons(deck, index) {
  if (!deck.iconUrls || deck.iconUrls.length === 0) {
    return { icons: [], primaryIcon: null };
  }

  const deckSlug = sanitizeFilename(deck.name);
  const iconPaths = [];

  for (let i = 0; i < Math.min(deck.iconUrls.length, 5); i++) {
    const url = deck.iconUrls[i];

    try {
      // Determine file extension
      const ext = path.extname(new URL(url).pathname) || '.png';
      const filename = `${deckSlug}-${i}${ext}`;
      const filepath = path.join(ICON_DIR, filename);

      console.log(`    Downloading icon ${i + 1}/${deck.iconUrls.length}...`);
      await downloadImage(url, filepath);

      // Store relative path for database
      iconPaths.push(`/images/deck-icons/${filename}`);

    } catch (err) {
      console.error(`    ❌ Failed to download icon: ${err.message}`);
    }
  }

  return {
    icons: iconPaths,
    primaryIcon: iconPaths.length > 0 ? iconPaths[0] : null
  };
}

async function saveDecksToDB(decks, downloadIcons = true) {
  console.log(`\n💾 Saving ${decks.length} decks to database...`);

  let created = 0;
  let skipped = 0;
  let iconsDownloaded = 0;

  // Ensure icon directory exists
  await fs.mkdir(ICON_DIR, { recursive: true });

  for (const [index, deck] of decks.entries()) {
    try {
      // Check if deck already exists
      const existing = await prisma.deck.findFirst({
        where: {
          OR: [
            { name: deck.name },
            { archetype: deck.name }
          ]
        }
      });

      if (existing) {
        console.log(`  ⏭️  Skipped (already exists): ${deck.name}`);
        skipped++;
        continue;
      }

      // Download icons if enabled
      let iconData = { icons: [], primaryIcon: null };
      if (downloadIcons && deck.iconUrls && deck.iconUrls.length > 0) {
        console.log(`  📥 Downloading icons for: ${deck.name}`);
        iconData = await downloadDeckIcons(deck, index);
        if (iconData.icons.length > 0) {
          iconsDownloaded++;
        }
      }

      // Create new deck
      await prisma.deck.create({
        data: {
          name: deck.name,
          archetype: deck.name,
          format: 'Standard',
          description: `${deck.name} deck archetype`,
          deckList: null,
          icon: iconData.primaryIcon,
          icons: iconData.icons.length > 0 ? JSON.stringify(iconData.icons) : null
        }
      });

      console.log(`  ✅ Created: ${deck.name}${iconData.icons.length > 0 ? ` (with ${iconData.icons.length} icon${iconData.icons.length > 1 ? 's' : ''})` : ''}`);
      created++;

    } catch (error) {
      console.error(`  ❌ Error saving ${deck.name}:`, error.message);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Icons Downloaded: ${iconsDownloaded}`);
  console.log(`   Total: ${decks.length}`);
}

async function clearExistingDecks() {
  console.log('🗑️  Clearing existing decks from database...');

  const deleted = await prisma.deck.deleteMany({});
  console.log(`   Deleted ${deleted.count} decks\n`);

  // Optionally clear icon directory
  try {
    const files = await fs.readdir(ICON_DIR);
    for (const file of files) {
      await fs.unlink(path.join(ICON_DIR, file));
    }
    console.log(`   Deleted ${files.length} icon files\n`);
  } catch (err) {
    // Directory might not exist, that's ok
  }
}

async function main() {
  console.log('🎴 PokeVods - Limitless TCG Deck Scraper with Icons\n');

  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const shouldSave = !args.includes('--dry-run');
  const skipIcons = args.includes('--no-icons');

  if (shouldClear) {
    await clearExistingDecks();
  }

  const decks = await scrapeLimitlessDecksWithIcons();

  if (decks.length === 0) {
    console.log('\n⚠️  No decks were scraped. Check limitless-debug.png to debug.');
    return;
  }

  if (shouldSave) {
    await saveDecksToDB(decks, !skipIcons);
  } else {
    console.log('\n🏃 Dry run mode - not saving to database');
    console.log(`   Found ${decks.length} decks that would be saved`);
    console.log(`   Icons would ${skipIcons ? 'NOT' : ''} be downloaded`);
  }

  console.log('\n✨ Done!');
}

main()
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
