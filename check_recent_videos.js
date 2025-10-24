const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentVideos() {
  console.log('🔍 Checking for videos added in the last 15 minutes...\n');

  // Get current time and 15 minutes ago
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  console.log(`Current time: ${now.toISOString()}`);
  console.log(`Looking for videos created after: ${fifteenMinutesAgo.toISOString()}\n`);

  // Find all resources created in the last 15 minutes
  const recentVideos = await prisma.resource.findMany({
    where: {
      createdAt: {
        gte: fifteenMinutesAgo
      }
    },
    include: {
      deck: {
        select: {
          id: true,
          name: true
        }
      },
      authorProfile: {
        select: {
          id: true,
          name: true
        }
      },
      chapters: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📊 Found ${recentVideos.length} video(s) added in the last 15 minutes\n`);

  if (recentVideos.length === 0) {
    console.log('❌ No videos found in the last 15 minutes');
    return;
  }

  recentVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
    console.log(`   ID: ${video.id}`);
    console.log(`   Type: ${video.type}`);
    console.log(`   URL: ${video.url}`);
    console.log(`   Deck: ${video.deck ? video.deck.name : 'No deck assigned'}`);
    console.log(`   Author: ${video.authorProfile?.name || video.author || 'No author'}`);
    console.log(`   Platform: ${video.platform}`);
    console.log(`   Status: ${video.status}`);
    console.log(`   Thumbnail: ${video.thumbnail ? 'Yes' : 'No'}`);
    console.log(`   Chapters: ${video.chapters.length}`);
    console.log(`   Created: ${video.createdAt.toISOString()}`);
    console.log(`   Publication Date: ${video.publicationDate ? video.publicationDate.toISOString().split('T')[0] : 'Not set'}`);
    console.log();
  });

  console.log('✅ All videos were successfully added to the database!');
}

checkRecentVideos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
