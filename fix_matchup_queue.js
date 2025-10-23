const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMatchupQueue() {
  try {
    console.log('\n🔍 Finding and removing old video...\n');

    // Find the specific video
    const oldVideo = await prisma.resource.findFirst({
      where: {
        url: 'https://www.youtube.com/watch?v=mYGGuEhpys0'
      },
      include: {
        deck: true
      }
    });

    if (oldVideo) {
      const date = oldVideo.publicationDate ? oldVideo.publicationDate.toISOString().split('T')[0] : 'No date';
      console.log('Found old video:');
      console.log('  Title:', oldVideo.title);
      console.log('  Date:', date);
      console.log('  Deck:', oldVideo.deck ? oldVideo.deck.name : 'Unknown');
      console.log('  URL:', oldVideo.url);

      // Delete it
      await prisma.resource.delete({
        where: { id: oldVideo.id }
      });

      console.log('\n✅ Deleted old video from matchup queue\n');
    } else {
      console.log('❌ Video not found in database\n');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixMatchupQueue();
