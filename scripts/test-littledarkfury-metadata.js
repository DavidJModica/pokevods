const fetch = require('node-fetch');

const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

// Function to fetch YouTube metadata using oEmbed
async function fetchYouTubeMetadata(videoUrl) {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const response = await fetch(oEmbedUrl);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Fetch the video page to get publication date and description
    const videoResponse = await fetch(videoUrl);
    const videoHtml = await videoResponse.text();

    // Extract publication date
    const dateMatch = videoHtml.match(/"publishDate":"([^"]+)"/);
    const publicationDate = dateMatch ? dateMatch[1] : null;

    // Extract description
    const descMatch = videoHtml.match(/"shortDescription":"([^"]+)"/);
    const description = descMatch ? descMatch[1].replace(/\\n/g, '\n') : '';

    return {
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
      publicationDate: publicationDate,
      description: description,
      url: videoUrl
    };
  } catch (error) {
    console.error(`Error fetching metadata:`, error.message);
    return null;
  }
}

async function testVideo() {
  const videoUrl = 'https://www.youtube.com/watch?v=eVgt2ixuY7U';

  console.log('Testing video metadata and filtering for:', videoUrl);
  console.log('==========================================\n');

  // Step 1: Fetch metadata
  console.log('Step 1: Fetching metadata...');
  const metadata = await fetchYouTubeMetadata(videoUrl);

  if (!metadata) {
    console.log('❌ Failed to fetch metadata');
    return;
  }

  console.log('✅ Metadata fetched successfully');
  console.log('   Title:', metadata.title);
  console.log('   Author:', metadata.author);
  console.log('   Publication Date:', metadata.publicationDate);
  console.log('   Thumbnail:', metadata.thumbnail);
  console.log('   Description preview:', metadata.description.substring(0, 100) + '...\n');

  // Step 2: Check publication date
  console.log('Step 2: Checking publication date...');
  if (!metadata.publicationDate) {
    console.log('❌ No publication date found - VIDEO WOULD BE SKIPPED');
    return;
  }

  const videoDate = new Date(metadata.publicationDate);
  console.log('   Video date:', videoDate.toISOString());
  console.log('   Video date (readable):', videoDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }));
  console.log('   Format cutoff:', MEGA_EVOLUTIONS_FORMAT_DATE.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  console.log('   Comparison:', videoDate < MEGA_EVOLUTIONS_FORMAT_DATE ? 'TOO OLD ❌' : 'VALID ✅');

  if (videoDate < MEGA_EVOLUTIONS_FORMAT_DATE) {
    console.log('\n❌ Video is too old (before Mega Evolutions format) - VIDEO WOULD BE SKIPPED');
    return;
  }

  console.log('✅ Video date is valid (after format date)\n');

  // Step 3: Check deck detection
  console.log('Step 3: Checking deck detection from title...');
  const title = metadata.title;
  console.log('   Full title:', title);

  // Test some common deck patterns
  const deckPatterns = [
    { pattern: /charizard/i, deck: 'Charizard ex' },
    { pattern: /miraidon/i, deck: 'Miraidon ex' },
    { pattern: /raging bolt/i, deck: 'Raging Bolt ex' },
    { pattern: /pikachu/i, deck: 'Pikachu ex' },
    { pattern: /gardevoir/i, deck: 'Gardevoir ex' },
  ];

  let detectedDeck = null;
  for (const { pattern, deck } of deckPatterns) {
    if (pattern.test(title)) {
      detectedDeck = deck;
      console.log(`   Pattern "${pattern}" matched!`);
      break;
    }
  }

  if (detectedDeck) {
    console.log('✅ Deck detected:', detectedDeck);
    console.log('   → Video would be AUTO-APPROVED ✨');
  } else {
    console.log('⚠️  No deck detected from title');
    console.log('   → Video would go to REVIEW QUEUE 📋');
  }

  console.log('\n==========================================');
  console.log('✅ RESULT: This video SHOULD BE ADDED!');
  console.log('==========================================');
}

testVideo().catch(console.error);
