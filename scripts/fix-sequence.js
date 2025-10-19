require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSequences() {
  console.log('🔧 Fixing PostgreSQL sequences...\n');

  try {
    // Fix Resource sequence
    const maxResourceId = await prisma.resource.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    if (maxResourceId) {
      const nextId = maxResourceId.id + 1;
      console.log(`📊 Max Resource ID: ${maxResourceId.id}`);
      console.log(`🔄 Setting Resource sequence to: ${nextId}`);

      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Resource"', 'id'), ${nextId}, false);`
      );
      console.log('✅ Resource sequence fixed!\n');
    }

    // Fix Chapter sequence
    const maxChapterId = await prisma.chapter.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    if (maxChapterId) {
      const nextId = maxChapterId.id + 1;
      console.log(`📊 Max Chapter ID: ${maxChapterId.id}`);
      console.log(`🔄 Setting Chapter sequence to: ${nextId}`);

      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Chapter"', 'id'), ${nextId}, false);`
      );
      console.log('✅ Chapter sequence fixed!\n');
    }

    // Fix Author sequence
    const maxAuthorId = await prisma.author.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    if (maxAuthorId) {
      const nextId = maxAuthorId.id + 1;
      console.log(`📊 Max Author ID: ${maxAuthorId.id}`);
      console.log(`🔄 Setting Author sequence to: ${nextId}`);

      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Author"', 'id'), ${nextId}, false);`
      );
      console.log('✅ Author sequence fixed!\n');
    }

    // Fix Deck sequence
    const maxDeckId = await prisma.deck.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    if (maxDeckId) {
      const nextId = maxDeckId.id + 1;
      console.log(`📊 Max Deck ID: ${maxDeckId.id}`);
      console.log(`🔄 Setting Deck sequence to: ${nextId}`);

      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Deck"', 'id'), ${nextId}, false);`
      );
      console.log('✅ Deck sequence fixed!\n');
    }

    console.log('🎉 All sequences have been fixed!');
    console.log('✨ You can now create new records without ID conflicts.');

  } catch (error) {
    console.error('❌ Error fixing sequences:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixSequences();
