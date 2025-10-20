require('dotenv').config({ path: '.env.local' });
const prisma = require('../lib/prisma');

async function checkVideo() {
  const videoUrl = 'https://www.youtube.com/watch?v=eVgt2ixuY7U';

  console.log('Checking if video exists in database...');
  console.log('URL:', videoUrl);
  console.log('==========================================\n');

  try {
    // Check exact URL match
    const exactMatch = await prisma.resource.findFirst({
      where: { url: videoUrl },
      include: {
        deck: true,
        author: true
      }
    });

    if (exactMatch) {
      console.log('✅ FOUND - Exact URL match:');
      console.log('   ID:', exactMatch.id);
      console.log('   Title:', exactMatch.title);
      console.log('   Status:', exactMatch.status);
      console.log('   Deck:', exactMatch.deck?.name || 'None');
      console.log('   Author:', exactMatch.author?.name || exactMatch.author);
      console.log('   Publication Date:', exactMatch.publicationDate);
    } else {
      console.log('❌ NOT FOUND - No exact URL match');
    }

    // Also check for the video ID in any URL
    const videoId = 'eVgt2ixuY7U';
    const partialMatch = await prisma.resource.findMany({
      where: {
        url: {
          contains: videoId
        }
      },
      include: {
        deck: true,
        author: true
      }
    });

    if (partialMatch.length > 0) {
      console.log('\n🔍 Found videos containing ID', videoId, ':');
      partialMatch.forEach(v => {
        console.log('   -', v.url, '(ID:', v.id, ')');
      });
    } else {
      console.log('\n❌ No videos found containing ID:', videoId);
    }

    // Check all LittleDarkFury videos
    console.log('\n📋 All LittleDarkFury videos in database:');
    const littleDarkFuryVideos = await prisma.resource.findMany({
      where: {
        OR: [
          { author: { contains: 'LittleDarkFury', mode: 'insensitive' } },
          { authorId: { in: [
            // We need to get the author ID first
            (await prisma.author.findFirst({
              where: { name: { contains: 'LittleDarkFury', mode: 'insensitive' } }
            }))?.id
          ].filter(Boolean) } }
        ]
      },
      orderBy: { publicationDate: 'desc' },
      take: 10
    });

    if (littleDarkFuryVideos.length > 0) {
      console.log(`   Found ${littleDarkFuryVideos.length} recent videos:`);
      littleDarkFuryVideos.forEach((v, idx) => {
        console.log(`   ${idx + 1}. ${v.title}`);
        console.log(`      URL: ${v.url}`);
        console.log(`      Date: ${v.publicationDate ? new Date(v.publicationDate).toLocaleDateString() : 'N/A'}`);
        console.log(`      Status: ${v.status}`);
        console.log('');
      });
    } else {
      console.log('   No LittleDarkFury videos found!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideo();
