const prisma = require('../lib/prisma');
const fetch = require('node-fetch');

// Format date for Mega Evolutions format (Sept 26, 2025)
const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

// Extract video URLs from a YouTube playlist or channel
async function extractVideoUrlsFromSource(sourceUrl) {
  try {
    const response = await fetch(sourceUrl);
    const html = await response.text();

    // Extract video IDs from the page
    // YouTube embeds video data in the page as JSON
    const videoIds = new Set();

    // Pattern 1: Match videoId in JSON objects
    const videoIdMatches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    for (const match of videoIdMatches) {
      videoIds.add(match[1]);
    }

    // Pattern 2: Match /watch?v= links
    const watchMatches = html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g);
    for (const match of watchMatches) {
      videoIds.add(match[1]);
    }

    // Convert to full URLs
    const urls = Array.from(videoIds).map(id => `https://www.youtube.com/watch?v=${id}`);

    console.log(`Extracted ${urls.length} video URLs from ${sourceUrl}`);
    return urls;

  } catch (error) {
    console.error('Error extracting videos from source:', error);
    throw new Error(`Failed to extract videos from source: ${error.message}`);
  }
}

module.exports = async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { deckId, source, sourceType } = req.body;

    if (!source) {
      return res.status(400).json({ error: 'source (URL or URLs) is required' });
    }

    // deckId is now optional - if not provided, we'll try to detect from video title

    let urls = [];

    // Determine source type and extract URLs
    if (sourceType === 'playlist' || (typeof source === 'string' && source.includes('playlist'))) {
      // Extract videos from playlist
      urls = await extractVideoUrlsFromSource(source);
    } else if (sourceType === 'channel' || (typeof source === 'string' && (source.includes('/@') || source.includes('/channel/') || source.includes('/c/')))) {
      // Extract videos from channel
      // For channels, we need to go to the videos page
      let channelVideosUrl = source;
      if (!source.includes('/videos')) {
        channelVideosUrl = source.endsWith('/') ? `${source}videos` : `${source}/videos`;
      }
      urls = await extractVideoUrlsFromSource(channelVideosUrl);
    } else if (Array.isArray(source)) {
      // Direct array of URLs
      urls = source;
    } else if (typeof source === 'string') {
      // Single URL or newline-separated URLs
      urls = source.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    }

    if (urls.length === 0) {
      return res.status(400).json({ error: 'No video URLs found' });
    }

    console.log(`Processing ${urls.length} videos`);

    // Get all decks for matching
    const allDecks = await prisma.deck.findMany();

    const results = [];

    for (const url of urls) {
      try {
        // Check for duplicate URL first
        const existingResource = await prisma.resource.findFirst({
          where: { url: url }
        });

        if (existingResource) {
          results.push({
            url,
            success: false,
            error: 'Duplicate URL - this video already exists in the database',
            existingResourceId: existingResource.id,
            existingResourceTitle: existingResource.title
          });
          continue;
        }

        // Fetch YouTube metadata
        const youtubeResponse = await fetch(`http://localhost:3002/api/youtube?url=${encodeURIComponent(url)}`);
        const youtubeData = await youtubeResponse.json();

        // Check if video is from before format date
        if (youtubeData.publicationDate) {
          const videoDate = new Date(youtubeData.publicationDate);
          if (videoDate < MEGA_EVOLUTIONS_FORMAT_DATE) {
            results.push({
              url,
              success: false,
              error: `Video is from before the Mega Evolutions format (Sept 26, 2025). Publication date: ${videoDate.toLocaleDateString()}`
            });
            continue;
          }
        }

        // Auto-detect deck from video title if deckId not provided
        let detectedDeckId = deckId ? parseInt(deckId) : null;
        let deckDetectionMethod = deckId ? 'provided' : null;

        if (!detectedDeckId && youtubeData.title) {
          // Try to find deck name in video title
          const titleLower = youtubeData.title.toLowerCase();

          // Normalize for matching (remove "ex" and trainer prefixes)
          const normalizeForMatching = (name) => {
            return name.toLowerCase()
              .replace(/\s+ex\b/g, '')
              .replace(/\b(ethan's|misty's|rocket's|iono's|lillie's)\s+/gi, '')
              .replace(/\s+/g, ' ')
              .trim();
          };

          const normalizedTitle = normalizeForMatching(titleLower);

          // Find best matching deck
          let bestMatch = null;
          let bestMatchScore = 0;

          for (const deck of allDecks) {
            const normalizedDeckName = normalizeForMatching(deck.name);

            // Check if deck name appears in title
            if (normalizedTitle.includes(normalizedDeckName)) {
              const score = normalizedDeckName.length;
              if (score > bestMatchScore) {
                bestMatchScore = score;
                bestMatch = deck;
              }
            }
          }

          if (bestMatch) {
            detectedDeckId = bestMatch.id;
            deckDetectionMethod = 'auto-detected';
            console.log(`Auto-detected deck "${bestMatch.name}" from title: "${youtubeData.title}"`);
          }
        }

        // If no deck detected, create resource without deck and add to review queue
        if (!detectedDeckId) {
          console.log(`No deck detected for "${youtubeData.title}" - adding to review queue`);

          // Create resource without deck (deckId will be null) and mark as pending
          const newResource = await prisma.resource.create({
            data: {
              deckId: null, // No deck assigned yet
              type: 'Gameplay', // Default type
              title: youtubeData.title || 'Untitled',
              url: url,
              author: youtubeData.author,
              platform: youtubeData.platform || 'YouTube',
              accessType: 'Free',
              publicationDate: youtubeData.publicationDate ? new Date(youtubeData.publicationDate) : null,
              thumbnail: youtubeData.thumbnail,
              decklist: youtubeData.decklist,
              status: 'pending' // Add to review queue for manual deck assignment
            }
          });

          results.push({
            url,
            success: true,
            title: youtubeData.title,
            message: 'Added to review queue - no deck detected (needs manual deck assignment)',
            resourceId: newResource.id,
            status: 'pending',
            needsManualDeck: true
          });
          continue;
        }

        // Determine if this video is complete
        const hasChapters = youtubeData.chapters && youtubeData.chapters.length > 0;
        const hasDecklist = youtubeData.decklist && youtubeData.decklist.length > 0;
        const isComplete = hasChapters || hasDecklist;

        // Create the resource with appropriate status
        const newResource = await prisma.resource.create({
          data: {
            deckId: detectedDeckId,
            type: 'Gameplay', // Default to Gameplay, can be edited later
            title: youtubeData.title || 'Untitled',
            url: url,
            author: youtubeData.author,
            platform: youtubeData.platform || 'YouTube',
            accessType: 'Free',
            publicationDate: youtubeData.publicationDate ? new Date(youtubeData.publicationDate) : null,
            thumbnail: youtubeData.thumbnail,
            decklist: youtubeData.decklist,
            status: isComplete ? 'approved' : 'pending'
          },
          include: {
            chapters: true
          }
        });

        // If we have chapters, create them
        if (hasChapters) {
          // Get all decks for matching
          const decks = await prisma.deck.findMany();

          for (const chapter of youtubeData.chapters) {
            let chapterType = 'Guide';
            let opposingDeckId = null;

            // If marked as matchup, try to find the deck
            if (chapter.isMatchup && chapter.opposingDeckName) {
              chapterType = 'Matchup';

              const opponentNameLower = chapter.opposingDeckName.toLowerCase();

              // Normalize names by removing "ex" and extra spaces for matching
              const normalizeForMatching = (name) => {
                return name.toLowerCase()
                  .replace(/\s+ex\b/g, '') // Remove " ex" suffix
                  .replace(/\b(ethan's|misty's|rocket's|iono's|lillie's)\s+/gi, '') // Remove trainer prefixes
                  .replace(/\s+/g, ' ') // Normalize spaces
                  .trim();
              };

              const normalizedOpponent = normalizeForMatching(opponentNameLower);

              // Split opponent name into Pokemon names
              const opponentPokemon = normalizedOpponent.split(/\s+/).filter(word =>
                word.length > 2 && !['and', 'the', 'of'].includes(word)
              );

              let matchingDeck = null;
              let bestMatchScore = 0;

              for (const deck of decks) {
                const deckNameLower = deck.name.toLowerCase();
                const normalizedDeck = normalizeForMatching(deckNameLower);

                // Exact match gets highest priority
                if (deckNameLower === opponentNameLower) {
                  matchingDeck = deck;
                  bestMatchScore = 1000;
                  break;
                }

                // Normalized exact match (ignoring "ex" and trainer names)
                if (normalizedDeck === normalizedOpponent) {
                  matchingDeck = deck;
                  bestMatchScore = 900;
                  break;
                }

                // Split deck name into Pokemon names
                const deckPokemon = normalizedDeck.split(/\s+/).filter(word =>
                  word.length > 2 && !['and', 'the', 'of'].includes(word)
                );

                // Calculate match score based on how many Pokemon names match
                let score = 0;
                let matchedPokemon = 0;

                // Check each Pokemon in opponent name
                for (let i = 0; i < Math.min(opponentPokemon.length, 2); i++) {
                  const opponentPoke = opponentPokemon[i];

                  // Check if this Pokemon exists in the deck name
                  for (let j = 0; j < deckPokemon.length; j++) {
                    if (deckPokemon[j] === opponentPoke) {
                      // Exact Pokemon name match
                      matchedPokemon++;
                      score += 100 * (i === 0 ? 2 : 1); // First Pokemon gets double weight
                    } else if (deckPokemon[j].startsWith(opponentPoke) || opponentPoke.startsWith(deckPokemon[j])) {
                      // Partial Pokemon name match (e.g., "char" matches "charizard")
                      matchedPokemon++;
                      score += 50 * (i === 0 ? 2 : 1);
                    }
                  }
                }

                // If opponent has 2+ Pokemon but only first matches, check if second Pokemon is valid
                if (opponentPokemon.length >= 2 && matchedPokemon === 1) {
                  // Check if the second Pokemon appears in ANY deck (to validate it's a real Pokemon)
                  const secondPokemon = opponentPokemon[1];
                  const isSecondValid = decks.some(d =>
                    normalizeForMatching(d.name).split(/\s+/).includes(secondPokemon)
                  );

                  // If second Pokemon isn't valid, boost single-Pokemon match score
                  if (!isSecondValid) {
                    score += 50; // Boost score for first Pokemon when second is invalid
                  }
                }

                // If this deck has better score, use it
                if (score > bestMatchScore) {
                  bestMatchScore = score;
                  matchingDeck = deck;
                }
              }

              // Only use match if score is above threshold
              if (matchingDeck && bestMatchScore >= 50) {
                opposingDeckId = matchingDeck.id;
              }
            }

            await prisma.chapter.create({
              data: {
                resourceId: newResource.id,
                timestamp: chapter.timestamp,
                title: chapter.title,
                chapterType: chapterType,
                opposingDeckId: opposingDeckId
              }
            });
          }
        }

        results.push({
          url,
          success: true,
          resourceId: newResource.id,
          deckId: detectedDeckId,
          deckDetectionMethod,
          title: youtubeData.title,
          status: newResource.status,
          hasChapters,
          hasDecklist
        });

      } catch (error) {
        console.error(`Error importing ${url}:`, error);
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      total: urls.length,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
