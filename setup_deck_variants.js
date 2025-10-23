const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupDeckVariants() {
  console.log('🔍 Finding deck variants...\n');

  // Get all decks
  const allDecks = await prisma.deck.findMany({
    orderBy: { name: 'asc' }
  });

  console.log(`Total decks: ${allDecks.length}\n`);

  // Common variant patterns
  const variantMappings = {
    // Charizard variants
    'Charizard Pidgeot': 'Charizard',
    'Charizard Dusknoir': 'Charizard',
    'Charizard Bibarel': 'Charizard',

    // Raging Bolt variants
    'Raging Bolt Ogerpon': 'Raging Bolt',
    'Raging Bolt Gouging Fire': 'Raging Bolt',

    // Other potential variants
    'Lugia Archeops': 'Lugia',
    'Giratina Comfey': 'Giratina',
    'Gardevoir Drifloon': 'Gardevoir',
  };

  let updatedCount = 0;

  for (const deck of allDecks) {
    let variantOf = null;

    // Check if this deck is a known variant
    if (variantMappings[deck.name]) {
      variantOf = variantMappings[deck.name];
    } else {
      // Auto-detect variants: if deck name contains another deck name + extra words
      for (const baseDeck of allDecks) {
        if (baseDeck.name !== deck.name && deck.name.startsWith(baseDeck.name + ' ')) {
          variantOf = baseDeck.name;
          break;
        }
      }
    }

    if (variantOf) {
      await prisma.deck.update({
        where: { id: deck.id },
        data: { variantOf }
      });
      console.log(`✅ ${deck.name} → variant of "${variantOf}"`);
      updatedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated ${updatedCount} decks with variant relationships`);

  // Show variant families
  console.log(`\n🔗 Variant Families:`);
  const variantFamilies = {};

  const updatedDecks = await prisma.deck.findMany({
    where: { variantOf: { not: null } },
    orderBy: { variantOf: 'asc' }
  });

  updatedDecks.forEach(deck => {
    if (!variantFamilies[deck.variantOf]) {
      variantFamilies[deck.variantOf] = [];
    }
    variantFamilies[deck.variantOf].push(deck.name);
  });

  Object.keys(variantFamilies).sort().forEach(parent => {
    console.log(`\n   ${parent}:`);
    variantFamilies[parent].forEach(variant => {
      console.log(`      - ${variant}`);
    });
  });

  await prisma.$disconnect();
}

setupDeckVariants().catch(console.error);
