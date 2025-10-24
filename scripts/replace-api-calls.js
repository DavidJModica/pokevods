const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'src', 'App.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Track replacements
let replacementCount = 0;

// Simple fetch GET calls (no request body)
const simpleReplacements = [
  // fetchDecks
  {
    find: /const response = await fetch\('\/api\/decks'\);\s+if \(!response\.ok\) throw new Error\([^)]+\);\s+const data = await response\.json\(\);/g,
    replace: 'const data = await api.fetchDecks();'
  },
  // fetchDeckById
  {
    find: /const response = await fetch\(`\/api\/decks\?id=\$\{id\}`\);\s+if \(!response\.ok\) throw new Error\([^)]+\);\s+const data = await response\.json\(\);/g,
    replace: 'const data = await api.fetchDeckById(id);'
  },
  // fetchDeckMatchups
  {
    find: /const response = await fetch\(`\/api\/deck-matchups\?id=\$\{deck\.id\}`\);/g,
    replace: 'const response = await api.fetchDeckMatchups(deck.id);'
  },
  // fetchAuthors
  {
    find: /const (?:response|authorsResponse) = await fetch\('\/api\/authors'\);\s+if \(!(?:response|authorsResponse)\.ok\) throw new Error\([^)]+\);\s+const (?:data|authors) = await (?:response|authorsResponse)\.json\(\);/g,
    replace: 'const authors = await api.fetchAuthors();'
  },
  // fetchAuthorBySlug
  {
    find: /const response = await fetch\(`\/api\/authors\?slug=\$\{slug\}`\);\s+if \(!response\.ok\) throw new Error\([^)]+\);\s+const data = await response\.json\(\);/g,
    replace: 'const data = await api.fetchAuthorBySlug(slug);'
  },
  // fetchPendingResources
  {
    find: /const response = await fetch\('\/api\/resources\?status=pending'\);\s+if \(!response\.ok\) throw new Error\([^)]+\);\s+const data = await response\.json\(\);/g,
    replace: 'const data = await api.fetchPendingResources();'
  },
  // fetchMatchupQueue
  {
    find: /const response = await fetch\('\/api\/matchup-queue'\);\s+if \(!response\.ok\) throw new Error\([^)]+\);\s+const data = await response\.json\(\);/g,
    replace: 'const data = await api.fetchMatchupQueue();'
  },
  // fetchGuideVideos
  {
    find: /const response = await fetch\('\/api\/guide-videos'\);\s+if \(!response\.ok\) throw new Error\([^)]+\);\s+const data = await response\.json\(\);/g,
    replace: 'const data = await api.fetchGuideVideos();'
  }
];

// Apply simple replacements
simpleReplacements.forEach(({ find, replace }) => {
  const matches = content.match(find);
  if (matches) {
    content = content.replace(find, replace);
    replacementCount += matches.length;
    console.log(`✓ Replaced ${matches.length} occurrence(s)`);
  }
});

// Write back
fs.writeFileSync(appJsPath, content, 'utf8');
console.log(`\n✅ Total replacements: ${replacementCount}`);
console.log(`✅ Updated ${appJsPath}`);
