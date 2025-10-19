const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function exportData() {
  try {
    console.log('📦 Exporting data from SQLite...\n');

    const data = {
      decks: await prisma.deck.findMany(),
      authors: await prisma.author.findMany(),
      resources: await prisma.resource.findMany(),
      chapters: await prisma.chapter.findMany()
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
    await prisma.$disconnect();
  }
}

exportData();
