const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixKeedrisThumbnails() {
  console.log('🔍 Finding Keedris Gaming videos without thumbnails...\n');

  // Find the Keedris Gaming author
  const keedris = await prisma.author.findFirst({
    where: {
      name: { contains: 'Keedris', mode: 'insensitive' }
    }
  });

  if (!keedris) {
    console.log('❌ Keedris Gaming author not found');
    console.log('Searching for videos by author name instead...\n');

    // Search by legacy author field
    const videos = await prisma.resource.findMany({
      where: {
        author: { contains: 'Keedris', mode: 'insensitive' },
        OR: [
          { thumbnail: null },
          { thumbnail: '' }
        ]
      },
      select: {
        id: true,
        title: true,
        url: true,
        author: true,
        thumbnail: true
      }
    });

    console.log(`Found ${videos.length} Keedris videos without thumbnails:\n`);

    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   URL: ${video.url}`);
      console.log(`   Thumbnail: ${video.thumbnail || 'MISSING'}\n`);
    });

    return videos;
  }

  console.log(`✅ Found author: ${keedris.name} (ID: ${keedris.id})\n`);

  // Find all videos by this author without thumbnails
  const videos = await prisma.resource.findMany({
    where: {
      authorId: keedris.id,
      OR: [
        { thumbnail: null },
        { thumbnail: '' }
      ]
    },
    select: {
      id: true,
      title: true,
      url: true,
      thumbnail: true
    }
  });

  console.log(`Found ${videos.length} videos without thumbnails:\n`);

  videos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
    console.log(`   URL: ${video.url}`);
    console.log(`   Thumbnail: ${video.thumbnail || 'MISSING'}\n`);
  });

  return videos;
}

fixKeedrisThumbnails()
  .then(videos => {
    console.log('\n📋 Summary:');
    console.log(`Total videos found: ${videos.length}`);
    if (videos.length > 0) {
      console.log('\nNext step: Fetch thumbnails from YouTube API');
    }
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
