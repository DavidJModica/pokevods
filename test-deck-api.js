const fetch = require('node-fetch');

async function testDeckAPI() {
  try {
    // Get first deck
    const decksResponse = await fetch('http://localhost:3002/api/decks');
    const decks = await decksResponse.json();

    if (decks.length > 0) {
      const firstDeckId = decks[0].id;
      console.log(`Testing deck ID: ${firstDeckId} (${decks[0].name})`);

      // Get single deck with resources
      const deckResponse = await fetch(`http://localhost:3002/api/decks?id=${firstDeckId}`);
      const deck = await deckResponse.json();

      console.log('\nDeck data:');
      console.log(`- Name: ${deck.name}`);
      console.log(`- Resources count: ${deck.resources?.length || 0}`);

      if (deck.resources && deck.resources.length > 0) {
        const firstResource = deck.resources[0];
        console.log('\nFirst resource:');
        console.log(`- Title: ${firstResource.title}`);
        console.log(`- Author (legacy): ${firstResource.author}`);
        console.log(`- AuthorId: ${firstResource.authorId}`);
        console.log(`- Has authorProfile: ${!!firstResource.authorProfile}`);
        if (firstResource.authorProfile) {
          console.log(`- authorProfile.name: ${firstResource.authorProfile.name}`);
          console.log(`- authorProfile.slug: ${firstResource.authorProfile.slug}`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testDeckAPI();
