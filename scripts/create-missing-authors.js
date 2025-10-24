const prisma = require('../lib/prisma');

async function createMissingAuthors() {
  try {
    console.log('Finding resources with author names but no authorId...\n');

    // Find all resources that have an author name but no authorId
    const resourcesWithoutAuthorId = await prisma.resource.findMany({
      where: {
        author: {
          not: null
        },
        authorId: null
      },
      select: {
        id: true,
        author: true,
        title: true
      }
    });

    console.log(`Found ${resourcesWithoutAuthorId.length} resources without authorId\n`);

    // Get unique author names
    const uniqueAuthorNames = [...new Set(resourcesWithoutAuthorId.map(r => r.author?.trim()).filter(Boolean))];
    console.log(`Unique author names to process: ${uniqueAuthorNames.length}\n`);

    let created = 0;
    let linked = 0;

    for (const authorName of uniqueAuthorNames) {
      console.log(`Processing: ${authorName}`);

      // Check if author already exists (case-insensitive)
      let authorRecord = await prisma.author.findFirst({
        where: {
          name: {
            equals: authorName,
            mode: 'insensitive'
          }
        }
      });

      // Create author if doesn't exist
      if (!authorRecord) {
        const slug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        authorRecord = await prisma.author.create({
          data: {
            name: authorName,
            slug: slug
          }
        });

        console.log(`  ✓ Created new author (ID: ${authorRecord.id})`);
        created++;
      } else {
        console.log(`  ✓ Found existing author (ID: ${authorRecord.id})`);
      }

      // Link all resources with this author name to the author record
      const resourcesWithThisAuthor = resourcesWithoutAuthorId.filter(
        r => r.author?.trim() === authorName
      );

      for (const resource of resourcesWithThisAuthor) {
        await prisma.resource.update({
          where: { id: resource.id },
          data: { authorId: authorRecord.id }
        });
        linked++;
      }

      console.log(`  ✓ Linked ${resourcesWithThisAuthor.length} resource(s)\n`);
    }

    console.log('\n=== Summary ===');
    console.log(`Authors created: ${created}`);
    console.log(`Resources linked: ${linked}`);
    console.log('\nDone!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createMissingAuthors();
