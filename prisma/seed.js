const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample decks
  const deck1 = await prisma.deck.create({
    data: {
      name: 'Charizard ex Control',
      archetype: 'Charizard ex',
      format: 'Standard',
      description: 'A control-oriented Charizard ex deck focusing on energy acceleration and board control.',
      deckList: `Pokémon: 14
4 Charmander
2 Charmeleon
4 Charizard ex
2 Pidgey
2 Pidgeot ex

Trainer: 34
4 Professor's Research
4 Nest Ball
4 Rare Candy
3 Boss's Orders
2 Iono
4 Ultra Ball
3 Battle VIP Pass
2 Choice Belt
4 Switch
2 Pal Pad
2 Hisuian Heavy Ball

Energy: 12
12 Fire Energy`,
      resources: {
        create: [
          {
            type: 'video',
            title: 'Charizard ex Deck Guide - Standard Format 2024',
            url: 'https://youtube.com/example1',
            author: 'AzulGG',
            platform: 'YouTube'
          },
          {
            type: 'article',
            title: 'Top 8 Regional Championship Report - Charizard ex',
            url: 'https://limitlesstcg.com/example1',
            author: 'John Doe',
            platform: 'LimitlessTCG'
          }
        ]
      }
    }
  });

  const deck2 = await prisma.deck.create({
    data: {
      name: 'Gardevoir ex',
      archetype: 'Gardevoir ex',
      format: 'Standard',
      description: 'Energy acceleration deck utilizing Gardevoir ex to power up attackers quickly.',
      deckList: `Pokémon: 16
4 Ralts
2 Kirlia
4 Gardevoir ex
2 Zacian V
2 Mew ex
2 Drifloon

Trainer: 32
4 Professor's Research
4 Battle VIP Pass
4 Rare Candy
3 Boss's Orders
4 Ultra Ball
3 Fog Crystal
2 Iono
4 Level Ball
2 Choice Belt
2 Escape Rope

Energy: 12
10 Psychic Energy
2 Double Turbo Energy`,
      resources: {
        create: [
          {
            type: 'video',
            title: 'Gardevoir ex Tournament Gameplay',
            url: 'https://youtube.com/example2',
            author: 'LittleDarkFury',
            platform: 'YouTube'
          },
          {
            type: 'guide',
            title: 'Complete Gardevoir ex Matchup Guide',
            url: 'https://pokebeach.com/example1',
            author: 'Jane Smith',
            platform: 'PokeBeach'
          }
        ]
      }
    }
  });

  const deck3 = await prisma.deck.create({
    data: {
      name: 'Lost Zone Box',
      archetype: 'Lost Zone',
      format: 'Standard',
      description: 'Versatile toolbox deck utilizing the Lost Zone mechanic to access powerful effects.',
      deckList: `Pokémon: 18
4 Comfey
2 Sableye
2 Cramorant
1 Manaphy
2 Radiant Greninja
1 Radiant Jirachi
2 Giratina VSTAR
2 Giratina V
1 Mew ex
1 Drapion V

Trainer: 30
4 Professor's Research
4 Colress's Experiment
3 Boss's Orders
2 Iono
4 Nest Ball
4 Ultra Ball
2 Mirage Gate
2 Choice Belt
2 Escape Rope
1 Counter Catcher
2 Beach Court

Energy: 12
4 Psychic Energy
4 Grass Energy
4 Water Energy`,
      resources: {
        create: [
          {
            type: 'tournament-report',
            title: 'Winning Lost Zone at Regionals - Tournament Report',
            url: 'https://limitlesstcg.com/example2',
            author: 'Mike Johnson',
            platform: 'LimitlessTCG'
          }
        ]
      }
    }
  });

  console.log('✅ Seeding complete!');
  console.log(`Created ${3} decks with resources`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
