require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

// Map DATABASE_URL and DIRECT_URL to PRISMA variables
process.env.PRISMA_DATABASE_URL = process.env.DATABASE_URL;
process.env.POSTGRES_URL = process.env.DIRECT_URL;

const prisma = new PrismaClient();

/**
 * Updates existing Metafy guides to create author profiles and link them
 */

async function updateMetafyAuthors() {
  console.log('🔄 Updating Metafy guide authors...\n');

  try {
    // Find all Metafy resources that have an author name but no authorId
    const metafyGuides = await prisma.resource.findMany({
      where: {
        platform: 'Metafy',
        author: {
          not: null
        },
        authorId: null
      }
    });

    console.log(`📄 Found ${metafyGuides.length} Metafy guides without author profiles\n`);

    let updated = 0;
    let errors = 0;

    for (const guide of metafyGuides) {
      try {
        if (!guide.author) {
          console.log(`⏭️  Skipped "${guide.title}" - no author name`);
          continue;
        }

        const slug = guide.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check if author exists
        let author = await prisma.author.findUnique({
          where: { slug }
        });

        if (!author) {
          // Create new author
          author = await prisma.author.create({
            data: {
              name: guide.author,
              slug: slug,
              metafy: null // We'll need to extract this from the guide URL manually if needed
            }
          });
          console.log(`   📝 Created new author: ${guide.author}`);
        }

        // Update the resource to link to the author
        await prisma.resource.update({
          where: { id: guide.id },
          data: { authorId: author.id }
        });

        console.log(`✅ Updated: ${guide.title}`);
        console.log(`   Linked to author: ${guide.author} (ID: ${author.id})\n`);
        updated++;

      } catch (error) {
        console.error(`❌ Error updating "${guide.title}":`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total: ${metafyGuides.length}`);

  } catch (error) {
    console.error('❌ Fatal error during update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateMetafyAuthors()
  .then(() => {
    console.log('\n🎉 Update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Update failed:', error);
    process.exit(1);
  });
