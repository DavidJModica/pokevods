const prisma = require('../lib/prisma');
const fetch = require('node-fetch');

const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

// Function to extract channel ID from various YouTube URL formats
function extractChannelId(channelUrl) {
  // Handle @username format
  const usernameMatch = channelUrl.match(/youtube\.com\/@([^\/\?]+)/);
  if (usernameMatch) {
    return { type: 'username', id: usernameMatch[1] };
  }

  // Handle /channel/ID format
  const channelMatch = channelUrl.match(/youtube\.com\/channel\/([^\/\?]+)/);
  if (channelMatch) {
    return { type: 'channel', id: channelMatch[1] };
  }

  // Handle /c/CustomName format
  const customMatch = channelUrl.match(/youtube\.com\/c\/([^\/\?]+)/);
  if (customMatch) {
    return { type: 'custom', id: customMatch[1] };
  }

  return null;
}

// Function to extract video URLs from YouTube channel page
async function fetchChannelVideos(channelUrl) {
  try {
    // Make sure we're fetching the /videos page
    let videosUrl = channelUrl;
    if (!videosUrl.includes('/videos')) {
      videosUrl = videosUrl.replace(/\/$/, '') + '/videos';
    }

    const response = await fetch(videosUrl);
    const html = await response.text();

    // Try multiple patterns to extract video IDs
    const videoIds = new Set();

    // Pattern 1: "videoId":"ID"
    const pattern1 = /"videoId":"([^"]+)"/g;
    let matches = [...html.matchAll(pattern1)];
    matches.forEach(match => videoIds.add(match[1]));

    // Pattern 2: /watch?v=ID in links
    const pattern2 = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    matches = [...html.matchAll(pattern2)];
    matches.forEach(match => videoIds.add(match[1]));

    // Pattern 3: "videoId": "ID" (with spaces)
    const pattern3 = /"videoId"\s*:\s*"([^"]+)"/g;
    matches = [...html.matchAll(pattern3)];
    matches.forEach(match => videoIds.add(match[1]));

    console.log(`   Extracted ${videoIds.size} unique video IDs from HTML`);

    // Log first few video IDs for debugging
    if (videoIds.size > 0) {
      const firstFew = Array.from(videoIds).slice(0, 5);
      console.log(`   First few video IDs: ${firstFew.join(', ')}`);
    }

    // Convert to full URLs
    const videoUrls = Array.from(videoIds).map(id => `https://www.youtube.com/watch?v=${id}`);

    return videoUrls;
  } catch (error) {
    console.error(`Error fetching channel ${channelUrl}:`, error.message);
    return [];
  }
}

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
    console.error(`Error fetching metadata for ${videoUrl}:`, error.message);
    return null;
  }
}

// Auto-detect deck from title
function detectDeckFromTitle(title) {
  const deckPatterns = [
    { pattern: /charizard/i, deck: 'Charizard' },
    { pattern: /gardevoir/i, deck: 'Gardevoir' },
    { pattern: /miraidon/i, deck: 'Miraidon' },
    { pattern: /dragapult/i, deck: 'Dragapult' },
    { pattern: /raging bolt/i, deck: 'Raging Bolt' },
    { pattern: /gholdengo/i, deck: 'Gholdengo' },
    { pattern: /lugia/i, deck: 'Lugia' },
    { pattern: /lost zone/i, deck: 'Lost Zone' },
    { pattern: /roaring moon/i, deck: 'Roaring Moon' },
    { pattern: /chien.pao/i, deck: 'Chien Pao' },
    { pattern: /pidgeot/i, deck: 'Pidgeot' },
    { pattern: /iron hands/i, deck: 'Iron Hands' },
    { pattern: /ancient box/i, deck: 'Ancient Box' },
    { pattern: /future box/i, deck: 'Future Box' },
    { pattern: /tera/i, deck: 'Tera Box' },
    { pattern: /ogrepon|ogerpon/i, deck: 'Ogerpon' },
    { pattern: /bloodmoon ursaluna|blood moon/i, deck: 'Bloodmoon Ursaluna' },
    { pattern: /alakazam/i, deck: 'Alakazam' },
    { pattern: /greninja/i, deck: 'Greninja' },
    { pattern: /toedscruel/i, deck: 'Toedscruel' },
    { pattern: /blissey/i, deck: 'Blissey' },
    { pattern: /crustle/i, deck: 'Crustle' },
    { pattern: /joltik/i, deck: 'Joltik Box' },
    { pattern: /okidogi/i, deck: 'Okidogi' },
    { pattern: /grimmsnarl/i, deck: 'Marnie\'s Grimmsnarl' },
    { pattern: /meowscarada/i, deck: 'Meowscarada' },
    { pattern: /archaludon/i, deck: 'Archaludon' },
    { pattern: /mega lucario/i, deck: 'Mega Lucario' },
    { pattern: /mega kangaskhan/i, deck: 'Mega Kangaskhan' },
    { pattern: /mega venusaur/i, deck: 'Mega Venusaur' },
    { pattern: /mega latias/i, deck: 'Mega Latias' },
    { pattern: /mega absol/i, deck: 'Mega Absol' },
    { pattern: /conkeldurr/i, deck: 'Conkeldurr' },
    { pattern: /ceruledge/i, deck: 'Ceruledge' }
  ];

  for (const { pattern, deck } of deckPatterns) {
    if (pattern.test(title)) {
      return deck;
    }
  }

  return null;
}

module.exports = async function handler(req, res) {
  const { method } = req;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Scanning author YouTube channels for new videos...');

    // Get authorIds from request body (optional)
    const { authorIds } = req.body || {};

    // Build query based on whether specific authors were selected
    const whereClause = {
      youtube: {
        not: null
      }
    };

    // If specific authors were selected, filter by their IDs
    if (authorIds && authorIds.length > 0) {
      whereClause.id = {
        in: authorIds
      };
    }

    // Fetch authors with YouTube channels
    const authors = await prisma.author.findMany({
      where: whereClause
    });

    console.log(`📊 Found ${authors.length} authors with YouTube channels`);

    const results = {
      authorsScanned: authors.length,
      newVideosFound: 0,
      videosAdded: 0,
      videosSkipped: 0,
      errors: [],
      authorResults: []
    };

    // Get all decks for matching
    const decks = await prisma.deck.findMany();

    for (const author of authors) {
      console.log(`\n🔍 Scanning: ${author.name} (${author.youtube})`);

      const authorResult = {
        name: author.name,
        youtube: author.youtube,
        videosFound: 0,
        videosAdded: 0,
        videosSkipped: 0,
        videosAlreadyInDb: 0,
        addedVideos: []
      };

      try {
        // Fetch video URLs from channel (function handles /videos internally)
        const videoUrls = await fetchChannelVideos(author.youtube);
        console.log(`   Found ${videoUrls.length} videos`);
        authorResult.videosFound = videoUrls.length;

        // Batch check all videos against database at once (more efficient)
        let existingVideos = [];
        try {
          existingVideos = await prisma.resource.findMany({
            where: {
              url: {
                in: videoUrls
              }
            },
            select: {
              url: true,
              id: true
            }
          });
          authorResult.videosAlreadyInDb = existingVideos.length;
          console.log(`   Database check: ${existingVideos.length} already exist`);
        } catch (dbError) {
          console.error(`   ❌ Batch database check error:`, dbError.message);
        }

        // Create a Set for fast lookup
        const existingUrls = new Set(existingVideos.map(v => v.url));

        for (const videoUrl of videoUrls) {
          // Check if video already exists (using batch results)
          if (existingUrls.has(videoUrl)) {
            const existingVideo = existingVideos.find(v => v.url === videoUrl);
            console.log(`   ⏭️  Skipping (already exists): ${videoUrl} (ID: ${existingVideo?.id})`);
            authorResult.videosSkipped++;
            continue; // Skip if already in database
          }

          // Fetch video metadata
          console.log(`   📥 Fetching metadata for: ${videoUrl}`);
          const metadata = await fetchYouTubeMetadata(videoUrl);

          if (!metadata) {
            console.log(`   ⏭️  Skipping (failed to fetch metadata): ${videoUrl}`);
            authorResult.videosSkipped++;
            continue;
          }

          // Handle publication date - use current date as fallback if missing
          let publicationDate;
          if (!metadata.publicationDate) {
            console.log(`   ⚠️  No date found, using today's date: ${metadata.title}`);
            publicationDate = new Date(); // Use today's date as fallback
          } else {
            publicationDate = new Date(metadata.publicationDate);

            // Skip if before format date
            if (publicationDate < MEGA_EVOLUTIONS_FORMAT_DATE) {
              console.log(`   ⏭️  Skipping (old): ${metadata.title} (${publicationDate.toLocaleDateString()})`);
              authorResult.videosSkipped++;
              continue;
            }
          }

          // Auto-detect deck
          const detectedDeckName = detectDeckFromTitle(metadata.title);
          let deckId = null;

          if (detectedDeckName) {
            const deck = decks.find(d => d.name.toLowerCase() === detectedDeckName.toLowerCase());
            if (deck) {
              deckId = deck.id;
              console.log(`   ✅ Detected deck: ${deck.name}`);
            }
          }

          // Create the resource as pending for review
          const newResource = await prisma.resource.create({
            data: {
              deckId: deckId,
              type: 'Gameplay', // Default to Gameplay, can be changed in review
              title: metadata.title,
              url: videoUrl,
              author: metadata.author,
              authorId: author.id,
              platform: 'YouTube',
              accessType: 'Free',
              publicationDate: publicationDate, // Use the processed date (either from metadata or today's date)
              thumbnail: metadata.thumbnail,
              status: deckId ? 'approved' : 'pending' // Auto-approve if deck detected, otherwise pending
            }
          });

          console.log(`   ➕ Added: ${metadata.title} ${deckId ? '(auto-approved)' : '(pending review)'}`);

          authorResult.videosAdded++;
          authorResult.addedVideos.push({
            title: metadata.title,
            url: videoUrl,
            deck: detectedDeckName || 'Not detected',
            status: deckId ? 'approved' : 'pending',
            date: videoDate.toLocaleDateString()
          });

          results.videosAdded++;
        }

        results.newVideosFound += authorResult.videosFound;
        results.videosSkipped += authorResult.videosSkipped;

      } catch (error) {
        console.error(`   ❌ Error scanning ${author.name}:`, error.message);
        authorResult.error = error.message;
        results.errors.push({
          author: author.name,
          error: error.message
        });
      }

      results.authorResults.push(authorResult);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SCAN SUMMARY');
    console.log('='.repeat(60));
    console.log(`Authors scanned: ${results.authorsScanned}`);
    console.log(`New videos found: ${results.newVideosFound}`);
    console.log(`Videos added: ${results.videosAdded}`);
    console.log(`Videos skipped: ${results.videosSkipped}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log('='.repeat(60));

    return res.status(200).json(results);

  } catch (error) {
    console.error('❌ Error during scan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
