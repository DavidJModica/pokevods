# PokeVods Scraping Scripts

These scripts scrape Pokemon TCG deck data from various sources and populate the database.

## Available Scripts

### Browser-based Scraper (Recommended)
Uses Puppeteer to load JavaScript-rendered pages.

```bash
# Dry run (preview without saving)
npm run scrape:dry

# Scrape and save to database
npm run scrape

# Clear existing decks and scrape fresh
npm run scrape:clear
```

### Simple HTTP Scraper
Faster but only works with static HTML (no JavaScript rendering).

```bash
node scripts/scrape-limitless.js --dry-run
node scripts/scrape-limitless.js
node scripts/scrape-limitless.js --clear
```

## How It Works

1. **Launches headless Chrome browser** using Puppeteer
2. **Navigates to Limitless TCG** deck database
3. **Waits for JavaScript** to render the page
4. **Takes a screenshot** (`limitless-debug.png`) for debugging
5. **Extracts deck data** including names, archetypes, icons
6. **Filters out invalid data** (stats, codes, percentages)
7. **Saves to database** (skips duplicates)

## Output

- **Screenshot**: `limitless-debug.png` - Full page screenshot for debugging
- **Console logs**: Detailed progress and results
- **Database**: Decks added to SQLite database

## Troubleshooting

If the scraper doesn't find decks:
1. Check `limitless-debug.png` to see what the page looks like
2. The page might require login or have anti-bot protection
3. The HTML structure might have changed - update selectors in the script

## Future Enhancements

- Add scrapers for other sources (PokeBeach, tournament results, etc.)
- Extract more data (deck lists, tournament placements, dates)
- Download and save Pokemon icons/images locally
- Scheduled automatic updates
