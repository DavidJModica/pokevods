const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./prisma/dev.db', { readonly: true });

try {
  console.log('📦 Exporting data from SQLite...\n');

  const data = {
    decks: db.prepare('SELECT * FROM Deck').all(),
    authors: db.prepare('SELECT * FROM Author').all(),
    resources: db.prepare('SELECT * FROM Resource').all(),
    chapters: db.prepare('SELECT * FROM Chapter').all()
  };

  console.log(`Found:`);
  console.log(`  - ${data.decks.length} decks`);
  console.log(`  - ${data.authors.length} authors`);
  console.log(`  - ${data.resources.length} resources`);
  console.log(`  - ${data.chapters.length} chapters\n`);

  fs.writeFileSync('./data-export.json', JSON.stringify(data, null, 2));
  console.log('✅ Data exported to data-export.json');

} catch (error) {
  console.error('❌ Export failed:', error);
} finally {
  db.close();
}
