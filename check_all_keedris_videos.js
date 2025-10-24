const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllKeedrisVideos() {
  console.log('🔍 Checking all Keedris Gaming videos...\n');

  // Find the Keedris Gaming author
  const keedris = await prisma.author.findFirst({
    where: {
      name: { contains: 'Keedris', mode: 'insensitive' }
    }
  });

  if (!keedris) {
    console.log('❌ Keedris Gaming author not found');
    return;
  }

  console.log(`✅ Found author: ${keedris.name} (ID: ${keedris.id})\n`);

  // Find all videos by this author
  const videos = await prisma.resource.findMany({
    where: {
      authorId: keedris.id
    },
    select: {
      id: true,
      title: true,
      url: true,
      thumbnail: true,
      type: true,
      publicationDate: true
    },
    orderBy: {
      publicationDate: 'desc'
    }
  });

  console.log(`📊 Total videos: ${videos.length}\n`);

  // Group by thumbnail status
  const withThumbnails = videos.filter(v => v.thumbnail && v.thumbnail.trim() !== '');
  const withoutThumbnails = videos.filter(v => !v.thumbnail || v.thumbnail.trim() === '');

  console.log('--- Videos WITH thumbnails ---');
  console.log(`Count: ${withThumbnails.length}\n`);
  withThumbnails.slice(0, 5).forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
    console.log(`   Thumbnail: ${video.thumbnail.substring(0, 80)}...`);
    console.log(`   Date: ${video.publicationDate ? video.publicationDate.toISOString().split('T')[0] : 'No date'}\n`);
  });

  if (withThumbnails.length > 5) {
    console.log(`   ... and ${withThumbnails.length - 5} more\n`);
  }

  console.log('\n--- Videos WITHOUT thumbnails ---');
  console.log(`Count: ${withoutThumbnails.length}\n`);
  withoutThumbnails.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
    console.log(`   URL: ${video.url}`);
    console.log(`   Thumbnail: ${video.thumbnail || 'NULL'}\n`);
  });

  // Check for placeholder thumbnails (common patterns)
  const placeholderPatterns = [
    'i.ytimg.com/vi//default.jpg',
    'i.ytimg.com/vi//hqdefault.jpg',
    'placeholder',
    'default.jpg',
    'no-thumbnail'
  ];

  const possiblePlaceholders = videos.filter(v => {
    if (!v.thumbnail) return false;
    return placeholderPatterns.some(pattern => v.thumbnail.includes(pattern));
  });

  if (possiblePlaceholders.length > 0) {
    console.log('\n--- Possible placeholder thumbnails ---');
    console.log(`Count: ${possiblePlaceholders.length}\n`);
    possiblePlaceholders.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Thumbnail: ${video.thumbnail}\n`);
    });
  }

  return { withThumbnails, withoutThumbnails, possiblePlaceholders };
}

checkAllKeedrisVideos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
