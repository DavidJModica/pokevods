require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Map DATABASE_URL and DIRECT_URL to PRISMA variables
process.env.PRISMA_DATABASE_URL = process.env.DATABASE_URL;
process.env.POSTGRES_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();

/**
 * Imports Metafy guides from metafy-guides.json into the database
 * Sets type to "Guide", platform to "Metafy", and accessType to "Paid"
 */

async function importMetafyGuides() {
  console.log('📥 Starting Metafy guides import...\n');

  try {
    // Read the JSON file
    const guidesData = JSON.parse(fs.readFileSync('metafy-guides.json', 'utf-8'));
    console.log(`📄 Found ${guidesData.length} guides in metafy-guides.json\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const guide of guidesData) {
      try {
        // Check if resource already exists by URL
        const existing = await prisma.resource.findFirst({
          where: { url: guide.url }
        });

        if (existing) {
          console.log(`⏭️  Skipped (already exists): ${guide.title}`);
          skipped++;
          continue;
        }

        // Parse the date - handle both ISO format and duration format
        let publicationDate = null;
        if (guide.date) {
          if (guide.date.startsWith('PT')) {
            // Duration format (PT51M) - skip for now as it's not a real date
            publicationDate = null;
          } else {
            // ISO format
            publicationDate = new Date(guide.date);
          }
        }

        // Create or find author profile
        let authorId = null;
        if (guide.author) {
          const slug = guide.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          // Check if author exists
          let author = await prisma.author.findUnique({
            where: { slug }
          });

          if (!author) {
            // Create new author with Metafy link if available
            author = await prisma.author.create({
              data: {
                name: guide.author,
                slug: slug,
                metafy: guide.metafyUrl || null
              }
            });
            console.log(`   📝 Created new author: ${guide.author}`);
          } else if (guide.metafyUrl && !author.metafy) {
            // Update existing author with Metafy URL if not already set
            author = await prisma.author.update({
              where: { id: author.id },
              data: { metafy: guide.metafyUrl }
            });
            console.log(`   📝 Updated author ${guide.author} with Metafy URL`);
          }

          authorId = author.id;
        }

        // Create the resource
        const resource = await prisma.resource.create({
          data: {
            title: guide.title,
            url: guide.url,
            author: guide.author, // Keep legacy field for backwards compatibility
            authorId: authorId, // Link to author profile
            type: 'Guide',
            platform: 'Metafy',
            accessType: 'Paid',
            status: 'approved',
            publicationDate: publicationDate,
            deckId: null // No deck assignment initially
          }
        });

        console.log(`✅ Imported: ${guide.title}`);
        console.log(`   Author: ${guide.author || 'N/A'}`);
        console.log(`   Date: ${publicationDate ? publicationDate.toISOString() : 'N/A'}`);
        console.log(`   URL: ${guide.url}\n`);
        imported++;

      } catch (error) {
        console.error(`❌ Error importing "${guide.title}":`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total: ${guidesData.length}`);

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importMetafyGuides()
  .then(() => {
    console.log('\n🎉 Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
