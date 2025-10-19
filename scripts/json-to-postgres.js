const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.import
require('dotenv').config({ path: path.resolve(__dirname, '../.env.import') });

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('📦 Importing data to PostgreSQL...\n');

    // Read the exported JSON data
    const data = JSON.parse(fs.readFileSync('./data-export.json', 'utf8'));

    console.log(`Found:`);
    console.log(`  - ${data.decks.length} decks`);
    console.log(`  - ${data.authors.length} authors`);
    console.log(`  - ${data.resources.length} resources`);
    console.log(`  - ${data.chapters.length} chapters\n`);

    // Import authors first (no dependencies)
    console.log('Importing authors...');
    for (const author of data.authors) {
      // Generate slug from name
      const slug = author.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await prisma.author.upsert({
        where: { id: author.id },
        update: {
          name: author.name,
          slug: slug,
          bio: author.bio,
          youtube: author.youtube,
          twitter: author.twitter,
          instagram: author.instagram,
          twitch: author.twitch,
          metafy: author.metafy
        },
        create: {
          id: author.id,
          name: author.name,
          slug: slug,
          bio: author.bio,
          youtube: author.youtube,
          twitter: author.twitter,
          instagram: author.instagram,
          twitch: author.twitch,
          metafy: author.metafy
        }
      });
    }
    console.log(`✅ Imported ${data.authors.length} authors\n`);

    // Import decks (no dependencies)
    console.log('Importing decks...');

    // First, try to insert all decks using raw SQL to preserve IDs
    for (const deck of data.decks) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Deck" (id, name, archetype, format, description, "deckList", icons, hidden, "createdAt", "updatedAt")
          VALUES (${deck.id}, ${deck.name}, ${deck.archetype}, ${deck.format}, ${deck.description}, ${deck.deckList}, ${deck.icons}, ${deck.hidden || false}, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            archetype = EXCLUDED.archetype,
            format = EXCLUDED.format,
            description = EXCLUDED.description,
            "deckList" = EXCLUDED."deckList",
            icons = EXCLUDED.icons,
            hidden = EXCLUDED.hidden,
            "updatedAt" = NOW()
        `;
      } catch (error) {
        console.error(`Error importing deck ${deck.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${data.decks.length} decks\n`);

    // Import resources (depends on decks and authors)
    console.log('Importing resources...');
    for (const resource of data.resources) {
      try {
        // Convert publicationDate from Unix timestamp (if it's a number) to JavaScript Date
        const pubDate = resource.publicationDate ? new Date(resource.publicationDate) : null;

        await prisma.$executeRaw`
          INSERT INTO "Resource" (id, "deckId", type, title, url, author, "authorId", platform, "accessType", "publicationDate", thumbnail, decklist, status, "createdAt", "updatedAt")
          VALUES (${resource.id}, ${resource.deckId}, ${resource.type}, ${resource.title}, ${resource.url}, ${resource.author}, ${resource.authorId}, ${resource.platform}, ${resource.accessType}, ${pubDate}, ${resource.thumbnail}, ${resource.decklist}, ${resource.status || 'approved'}, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            "deckId" = EXCLUDED."deckId",
            type = EXCLUDED.type,
            title = EXCLUDED.title,
            url = EXCLUDED.url,
            author = EXCLUDED.author,
            "authorId" = EXCLUDED."authorId",
            platform = EXCLUDED.platform,
            "accessType" = EXCLUDED."accessType",
            "publicationDate" = EXCLUDED."publicationDate",
            thumbnail = EXCLUDED.thumbnail,
            decklist = EXCLUDED.decklist,
            status = EXCLUDED.status,
            "updatedAt" = NOW()
        `;
      } catch (error) {
        console.error(`Error importing resource ${resource.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${data.resources.length} resources\n`);

    // Import chapters (depends on resources and decks)
    console.log('Importing chapters...');
    for (const chapter of data.chapters) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Chapter" (id, "resourceId", timestamp, title, "chapterType", "opposingDeckId", "createdAt")
          VALUES (${chapter.id}, ${chapter.resourceId}, ${chapter.timestamp}, ${chapter.title}, ${chapter.chapterType}, ${chapter.opposingDeckId}, NOW())
          ON CONFLICT (id) DO UPDATE SET
            "resourceId" = EXCLUDED."resourceId",
            timestamp = EXCLUDED.timestamp,
            title = EXCLUDED.title,
            "chapterType" = EXCLUDED."chapterType",
            "opposingDeckId" = EXCLUDED."opposingDeckId"
        `;
      } catch (error) {
        console.error(`Error importing chapter ${chapter.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${data.chapters.length} chapters\n`);

    console.log('🎉 Import complete!');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
