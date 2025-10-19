const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

async function updateAuthorYouTubeUrls() {
  try {
    // Get all authors with their resources
    const authors = await prisma.author.findMany();

    console.log(`Found ${authors.length} authors`);

    for (const author of authors) {
      if (!author.youtube) {
        // Find a YouTube resource for this author
        const youtubeResource = await prisma.resource.findFirst({
          where: {
            authorId: author.id,
            platform: 'YouTube'
          }
        });

        if (youtubeResource) {
          try {
            // Fetch YouTube data to get channel URL
            const response = await fetch(`http://localhost:3002/api/youtube?url=${encodeURIComponent(youtubeResource.url)}`);
            const data = await response.json();

            if (data.authorUrl) {
              await prisma.author.update({
                where: { id: author.id },
                data: { youtube: data.authorUrl }
              });
              console.log(`✓ Updated ${author.name}: ${data.authorUrl}`);
            } else {
              console.log(`✗ No channel URL found for ${author.name}`);
            }
          } catch (error) {
            console.error(`✗ Failed to update ${author.name}:`, error.message);
          }
        } else {
          console.log(`- ${author.name} has no YouTube resources`);
        }
      } else {
        console.log(`- ${author.name} already has YouTube URL`);
      }
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAuthorYouTubeUrls();
