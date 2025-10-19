const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Scrapes guide data from Metafy Pokemon TCG guides page
 * Extracts: Guide Name, Date, Price, Author, Link URL
 */

const METAFY_GUIDES_URL = 'https://metafy.gg/pokemon-trading-card-game-online/guides';

async function scrapeMetafyGuides() {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: false, // Set to false initially to debug
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('🔍 Navigating to Metafy guides page...');
    await page.goto(METAFY_GUIDES_URL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('⏳ Waiting for content to load...');

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('📸 Taking screenshot for debugging...');
    await page.screenshot({ path: 'metafy-debug.png', fullPage: true });

    console.log('📄 Extracting guide data from page...');

    // Extract guide data using page.evaluate (runs in browser context)
    const guides = await page.evaluate(() => {
      const results = [];

      // Try multiple selectors to find guide cards/items
      const selectors = [
        '[class*="guide"]',
        '[class*="card"]',
        'a[href*="/guide"]',
        '[data-guide]',
        'article',
        '.grid > div',
        '[class*="item"]'
      ];

      let guideElements = [];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          guideElements = Array.from(elements);
          break;
        }
      }

      // If no guides found with selectors, try to find any grid/list structure
      if (guideElements.length === 0) {
        const containers = document.querySelectorAll('[class*="grid"], [class*="list"], .container > div');
        for (const container of containers) {
          const children = Array.from(container.children);
          if (children.length > 3) {
            console.log(`Found potential guide list with ${children.length} items`);
            guideElements = children;
            break;
          }
        }
      }

      // Extract data from each guide element
      guideElements.forEach((el, index) => {
        try {
          // Find guide title/name
          const titleEl = el.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="name"]');
          const title = titleEl ? titleEl.textContent.trim() : null;

          // Find author
          const authorEl = el.querySelector('[class*="author"], [class*="creator"], [class*="by"], [class*="user"]');
          const author = authorEl ? authorEl.textContent.trim() : null;

          // Find date
          const dateEl = el.querySelector('[class*="date"], [class*="time"], time');
          const date = dateEl ? (dateEl.getAttribute('datetime') || dateEl.textContent.trim()) : null;

          // Find price
          const priceEl = el.querySelector('[class*="price"], [class*="cost"]');
          const price = priceEl ? priceEl.textContent.trim() : null;

          // Find link URL
          const linkEl = el.querySelector('a[href*="/guide"], a[href]');
          const url = linkEl ? linkEl.href : null;

          // Only add if we found at least a title and URL
          if (title && url) {
            results.push({
              title,
              author,
              date,
              price,
              url
            });
          }
        } catch (error) {
          console.log(`Error extracting data from element ${index}:`, error.message);
        }
      });

      return results;
    });

    console.log(`\n✅ Found ${guides.length} guides\n`);

    // Filter to only keep guide URLs (not author pages)
    const filteredGuides = guides.filter(g => g.url.includes('/guides/view/'));
    console.log(`📝 Filtered to ${filteredGuides.length} unique guide pages\n`);

    // Visit each guide page to extract author, date, and price
    console.log('🔍 Extracting detailed information from each guide...\n');

    for (let i = 0; i < filteredGuides.length; i++) {
      const guide = filteredGuides[i];
      console.log(`[${i + 1}/${filteredGuides.length}] Processing: ${guide.title}`);

      try {
        await page.goto(guide.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Wait a bit for content to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract detailed info from the guide page
        const details = await page.evaluate(() => {
          // Try to find author
          const authorSelectors = [
            '[class*="author"]',
            '[class*="creator"]',
            '[data-author]',
            'a[href^="/@"]'
          ];
          let author = null;
          for (const selector of authorSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              author = el.textContent.trim();
              break;
            }
          }

          // Try to find date
          const dateSelectors = [
            'time',
            '[datetime]',
            '[class*="date"]',
            '[class*="published"]'
          ];
          let date = null;
          for (const selector of dateSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              date = el.getAttribute('datetime') || el.textContent.trim();
              break;
            }
          }

          // Try to find price
          const priceSelectors = [
            '[class*="price"]',
            '[class*="cost"]',
            '[class*="amount"]'
          ];
          let price = null;
          for (const selector of priceSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.match(/\$|free|price/i)) {
              price = el.textContent.trim();
              break;
            }
          }

          return { author, date, price };
        });

        // Update the guide with detailed info
        guide.author = details.author;
        guide.date = details.date;
        guide.price = details.price;

        console.log(`   ✓ Author: ${guide.author || 'N/A'}, Date: ${guide.date || 'N/A'}, Price: ${guide.price || 'N/A'}`);

      } catch (error) {
        console.log(`   ✗ Error processing guide: ${error.message}`);
      }
    }

    // Display final results
    console.log('\n📋 Final Results:\n');
    filteredGuides.forEach((guide, index) => {
      console.log(`${index + 1}. ${guide.title}`);
      console.log(`   Author: ${guide.author || 'N/A'}`);
      console.log(`   Date: ${guide.date || 'N/A'}`);
      console.log(`   Price: ${guide.price || 'N/A'}`);
      console.log(`   URL: ${guide.url}\n`);
    });

    // Save to JSON file
    const outputPath = 'metafy-guides.json';
    fs.writeFileSync(outputPath, JSON.stringify(filteredGuides, null, 2));
    console.log(`💾 Saved ${filteredGuides.length} guides to ${outputPath}`);

    return filteredGuides;

  } catch (error) {
    console.error('❌ Error scraping Metafy:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeMetafyGuides()
  .then(guides => {
    console.log(`\n🎉 Successfully scraped ${guides.length} guides from Metafy`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  });
