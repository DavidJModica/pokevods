require('dotenv').config({ path: '.env.production' });
process.env.PRISMA_DATABASE_URL = process.env.DATABASE_URL;
process.env.POSTGRES_URL = process.env.DIRECT_URL;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const metafyResources = await prisma.resource.findMany({
    where: { platform: 'Metafy' },
    select: {
      id: true,
      title: true,
      platform: true,
      type: true,
      accessType: true,
      status: true,
      deckId: true
    }
  });
  console.log('\nFound', metafyResources.length, 'Metafy resources:\n');
  metafyResources.forEach(r => {
    console.log('- ID:', r.id, '| Title:', r.title);
    console.log('  Type:', r.type, '| Access:', r.accessType, '| Status:', r.status, '| DeckId:', r.deckId, '\n');
  });
  await prisma.$disconnect();
})();
