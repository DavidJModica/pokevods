const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAuthors() {
  try {
    // Get all unique author names from resources
    const resources = await prisma.resource.findMany({
      where: {
        author: { not: null },
        authorId: null // Only migrate resources without authorId
      },
      select: {
        id: true,
        author: true
      }
    });

    console.log(`Found ${resources.length} resources with text authors but no authorId`);

    // Get unique author names
    const uniqueAuthors = [...new Set(resources.map(r => r.author).filter(Boolean))];
    console.log(`Unique authors: ${uniqueAuthors.length}`);
    console.log(uniqueAuthors);

    // For each unique author, create or find Author profile
    for (const authorName of uniqueAuthors) {
      // Create slug
      const slug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Find or create author
      let author = await prisma.author.findUnique({
        where: { slug }
      });

      if (!author) {
        author = await prisma.author.create({
          data: {
            name: authorName,
            slug: slug
          }
        });
        console.log(`Created author profile: ${authorName} (${slug})`);
      } else {
        console.log(`Author profile already exists: ${authorName} (${slug})`);
      }

      // Update all resources with this author name
      const updateResult = await prisma.resource.updateMany({
        where: {
          author: authorName,
          authorId: null
        },
        data: {
          authorId: author.id
        }
      });

      console.log(`  Updated ${updateResult.count} resources for ${authorName}`);
    }

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Error migrating authors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAuthors();
