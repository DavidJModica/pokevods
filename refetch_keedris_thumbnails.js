const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Extract YouTube video ID from URL
function getYouTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

// Get the best available thumbnail from YouTube
function getYouTubeThumbnail(videoId) {
  // Try different thumbnail qualities in order of preference
  // Note: We'll return hqdefault which is more reliable than maxresdefault
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

async function refetchKeedrisThumbnails() {
  console.log('🔍 Refetching Keedris Gaming thumbnails...\n');

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
      authorId: keedris.id,
      url: { not: null }
    },
    select: {
      id: true,
      title: true,
      url: true,
      thumbnail: true
    }
  });

  console.log(`📊 Found ${videos.length} videos\n`);

  let updatedCount = 0;

  for (const video of videos) {
    const videoId = getYouTubeVideoId(video.url);

    if (!videoId) {
      console.log(`⚠️  Could not extract video ID from: ${video.url}`);
      continue;
    }

    const newThumbnail = getYouTubeThumbnail(videoId);
    const oldThumbnail = video.thumbnail;

    // Update if thumbnail is different or broken (maxresdefault)
    if (oldThumbnail !== newThumbnail || oldThumbnail?.includes('maxresdefault')) {
      await prisma.resource.update({
        where: { id: video.id },
        data: { thumbnail: newThumbnail }
      });

      console.log(`✅ Updated: ${video.title}`);
      console.log(`   Old: ${oldThumbnail}`);
      console.log(`   New: ${newThumbnail}\n`);
      updatedCount++;
    } else {
      console.log(`✓ Skipped (already correct): ${video.title.substring(0, 60)}...`);
    }
  }

  console.log(`\n📋 Summary:`);
  console.log(`   Total videos: ${videos.length}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${videos.length - updatedCount}`);
}

refetchKeedrisThumbnails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
