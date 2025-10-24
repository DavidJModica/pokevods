const fs = require('fs');

// Read the API file
let content = fs.readFileSync('api/resources.js', 'utf8');

console.log('Fixing resources API to support fetching all resources...\n');

// Replace the "Deck ID is required" error with code to fetch all resources
const oldCode = `        // Get all resources for a deck (only approved by default)
        if (!deckId) {
          return res.status(400).json({ error: 'Deck ID is required' });
        }

        const resources = await prisma.resource.findMany({
          where: {
            deckId: parseInt(deckId),
            status: 'approved' // Only show approved resources on deck pages
          },`;

const newCode = `        // Get all resources (for admin management) when no deckId provided
        if (!deckId) {
          const allResources = await prisma.resource.findMany({
            include: {
              deck: {
                select: {
                  id: true,
                  name: true,
                  icons: true
                }
              },
              authorProfile: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              },
              chapters: {
                include: {
                  opposingDeck: {
                    select: {
                      id: true,
                      name: true,
                      icons: true
                    }
                  }
                },
                orderBy: { timestamp: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          return res.status(200).json(allResources);
        }

        // Get all resources for a specific deck (only approved by default)
        const resources = await prisma.resource.findMany({
          where: {
            deckId: parseInt(deckId),
            status: 'approved' // Only show approved resources on deck pages
          },`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  console.log('✅ Updated API to support fetching all resources');
} else {
  console.log('⚠️  Could not find the exact pattern to replace');
  console.log('Trying alternative approach...');

  // Alternative: just replace the error check
  const altOld = `        if (!deckId) {
          return res.status(400).json({ error: 'Deck ID is required' });
        }`;

  const altNew = `        // Get all resources (for admin management) when no deckId provided
        if (!deckId) {
          const allResources = await prisma.resource.findMany({
            include: {
              deck: {
                select: {
                  id: true,
                  name: true,
                  icons: true
                }
              },
              authorProfile: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              },
              chapters: {
                include: {
                  opposingDeck: {
                    select: {
                      id: true,
                      name: true,
                      icons: true
                    }
                  }
                },
                orderBy: { timestamp: 'asc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          return res.status(200).json(allResources);
        }`;

  if (content.includes(altOld)) {
    content = content.replace(altOld, altNew);
    console.log('✅ Updated API using alternative approach');
  } else {
    console.log('❌ Could not update the file');
  }
}

// Write the updated content
fs.writeFileSync('api/resources.js', content, 'utf8');

console.log('\n✅ API updated successfully!');
console.log('The /api/resources endpoint now returns all resources when called with no parameters.');
