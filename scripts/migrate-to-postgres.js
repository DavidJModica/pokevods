const { PrismaClient: SqlitePrismaClient } = require('@prisma/client');
const { PrismaClient: PostgresPrismaClient } = require('@prisma/client');

// Create two Prisma clients - one for SQLite (local) and one for Postgres (production)
const sqliteClient = new SqlitePrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_DATABASE_URL
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from SQLite to Postgres...\n');

    // 1. Migrate Authors
    console.log('📝 Migrating Authors...');
    const authors = await sqliteClient.author.findMany();
    for (const author of authors) {
      await postgresClient.author.upsert({
        where: { id: author.id },
        update: author,
        create: author
      });
    }
    console.log(`✅ Migrated ${authors.length} authors\n`);

    // 2. Migrate Decks
    console.log('🎴 Migrating Decks...');
    const decks = await sqliteClient.deck.findMany();
    for (const deck of decks) {
      await postgresClient.deck.upsert({
        where: { id: deck.id },
        update: deck,
        create: deck
      });
    }
    console.log(`✅ Migrated ${decks.length} decks\n`);

    // 3. Migrate Resources
    console.log('📚 Migrating Resources...');
    const resources = await sqliteClient.resource.findMany();
    for (const resource of resources) {
      await postgresClient.resource.upsert({
        where: { id: resource.id },
        update: resource,
        create: resource
      });
    }
    console.log(`✅ Migrated ${resources.length} resources\n`);

    // 4. Migrate Chapters
    console.log('📖 Migrating Chapters...');
    const chapters = await sqliteClient.chapter.findMany();
    for (const chapter of chapters) {
      await postgresClient.chapter.upsert({
        where: { id: chapter.id },
        update: chapter,
        create: chapter
      });
    }
    console.log(`✅ Migrated ${chapters.length} chapters\n`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

migrateData();
