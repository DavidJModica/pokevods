const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyIcons() {
  const decks = await prisma.deck.findMany({ take: 15 });

  console.log('\n📊 Deck Icons Verification:\n');

  decks.forEach(deck => {
    const iconCount = deck.icons ? JSON.parse(deck.icons).length : 0;
    const icons = deck.icons ? JSON.parse(deck.icons) : [];
    console.log(`${deck.name}:`);
    console.log(`  ${iconCount} icon(s)`);
    if (icons.length > 0) {
      icons.forEach((icon, i) => console.log(`    ${i + 1}. ${icon}`));
    }
    console.log('');
  });

  await prisma.$disconnect();
}

verifyIcons();
