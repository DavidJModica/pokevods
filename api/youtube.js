// Extract YouTube video ID from various URL formats
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

module.exports = async function handler(req, res) {
  const { method, query } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  const { url } = query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Use YouTube oEmbed endpoint (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedResponse = await fetch(oembedUrl);

    if (!oembedResponse.ok) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const oembedData = await oembedResponse.json();

    // Get higher quality thumbnail
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Extract channel ID from author_url to get channel avatar
    // author_url format: https://www.youtube.com/@channelname or https://www.youtube.com/channel/CHANNELID
    let channelAvatarUrl = null;
    if (oembedData.author_url) {
      try {
        // Fetch the channel page to get the avatar
        const channelResponse = await fetch(oembedData.author_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const channelHtml = await channelResponse.text();

        // Look for channel avatar in meta tags or structured data
        const avatarMatch = channelHtml.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
        if (avatarMatch && avatarMatch[1]) {
          channelAvatarUrl = avatarMatch[1];
        }
      } catch (avatarError) {
        console.log('Could not fetch channel avatar:', avatarError.message);
      }
    }

    // Fetch the YouTube page to extract publication date, description, and chapters
    let publicationDate = null;
    let chapters = [];
    let decklist = null;

    try {
      const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const pageResponse = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await pageResponse.text();

      // Look for uploadDate in the JSON-LD structured data
      const uploadDateMatch = html.match(/"uploadDate":"([^"]+)"/);
      if (uploadDateMatch && uploadDateMatch[1]) {
        publicationDate = uploadDateMatch[1];
      }

      // Extract description from the page - try multiple patterns
      let description = '';

      // Try pattern 1: simpleText format
      let descriptionMatch = html.match(/"description":\{"simpleText":"([^"]+)"\}/);

      // Try pattern 2: attributedDescriptionBodyText with runs
      if (!descriptionMatch) {
        const runsMatch = html.match(/"attributedDescriptionBodyText":\{"content":"([^"]+)"/);
        if (runsMatch) {
          descriptionMatch = runsMatch;
        }
      }

      // Try pattern 3: Look for description in videoDetails
      if (!descriptionMatch) {
        const videoDetailsMatch = html.match(/"videoDetails":\{[^}]*"shortDescription":"([^"]+)"/);
        if (videoDetailsMatch) {
          descriptionMatch = videoDetailsMatch;
        }
      }

      if (descriptionMatch && descriptionMatch[1]) {
        // Decode unicode escape sequences
        description = descriptionMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
      }

      console.log('Description length:', description.length);
      console.log('First 200 chars:', description.substring(0, 200));

      // Parse chapters from description
      // Chapter format: timestamp followed by title
      // Examples: "0:00 Intro", "1:23 Game 1", "12:34:56 Final thoughts"
      const timestampPattern = /^(\d{1,2}:?\d{0,2}:\d{2}|\d{1,2}:\d{2})\s+(.+)$/gm;
      const chapterMatches = [...description.matchAll(timestampPattern)];

      chapters = chapterMatches.map(match => {
        const timestamp = match[1];
        const title = match[2].trim();

        // Detect if this is a matchup chapter
        // Look for "VS", "vs", "v.", or deck names patterns
        const isMatchup = /\b(vs\.?|versus|against)\b/i.test(title) ||
                         /^(game \d+:?\s*)?vs\s/i.test(title);

        // Extract opposing deck name if it's a matchup
        let opposingDeckName = null;
        if (isMatchup) {
          // Remove common prefixes like "VS ", "Game 1: VS ", etc.
          let deckPart = title.replace(/^(game \d+:?\s*)?vs\.?\s+/i, '');
          // Remove common suffixes like " Deck", " Game", etc.
          deckPart = deckPart.replace(/\s+(deck|game|match|matchup)$/i, '');
          opposingDeckName = deckPart.trim();
          console.log(`Extracted deck name from "${title}": "${opposingDeckName}"`);
        }

        return {
          timestamp,
          title,
          isMatchup,
          opposingDeckName
        };
      });

      // Parse decklist from description
      // Look for Pokemon card list patterns - match all three sections (Pokemon, Trainer, Energy)
      const fullDecklistPattern = /(?:Pok[ée]mon|POKEMON):\s*\d+[\s\S]*?(?:Energy|ENERGY):\s*\d+[\s\S]*?(?=\n\s*\n|$)/i;
      const fullDecklistMatch = description.match(fullDecklistPattern);

      if (fullDecklistMatch) {
        // Clean up the decklist - stop at first empty line after Energy section
        let decklistText = fullDecklistMatch[0];

        // Find the Energy section and everything after it up to the first empty line
        const energyMatch = decklistText.match(/((?:Energy|ENERGY):\s*\d+[\s\S]*?)(?=\n\s*\n|$)/i);
        if (energyMatch) {
          // Get everything up to and including the Energy section, then stop at first empty line
          const energyEndIndex = decklistText.indexOf(energyMatch[1]) + energyMatch[1].length;
          const afterEnergy = decklistText.substring(energyEndIndex);
          const emptyLineMatch = afterEnergy.match(/\n\s*\n/);

          if (emptyLineMatch) {
            decklist = decklistText.substring(0, energyEndIndex + emptyLineMatch.index).trim();
          } else {
            decklist = decklistText.trim();
          }
        } else {
          decklist = decklistText.trim();
        }
      }
    } catch (parseError) {
      console.log('Could not parse YouTube metadata:', parseError.message);
      // Continue without chapters/decklist - not critical errors
    }

    return res.json({
      title: oembedData.title,
      author: oembedData.author_name,
      authorUrl: oembedData.author_url, // Channel URL
      authorAvatar: channelAvatarUrl, // Channel profile picture
      thumbnail: thumbnail,
      platform: 'YouTube',
      publicationDate: publicationDate,
      chapters: chapters,
      decklist: decklist
    });

  } catch (error) {
    console.error('YouTube fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch YouTube data',
      details: error.message
    });
  }
};
