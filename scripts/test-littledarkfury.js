const fetch = require('node-fetch');

// Function to extract video URLs from YouTube channel page
async function fetchChannelVideos(channelUrl) {
  try {
    // Make sure we're fetching the /videos page
    let videosUrl = channelUrl;
    if (!videosUrl.includes('/videos')) {
      videosUrl = videosUrl.replace(/\/$/, '') + '/videos';
    }

    console.log(`Fetching: ${videosUrl}`);
    const response = await fetch(videosUrl);
    const html = await response.text();

    console.log(`HTML length: ${html.length} characters`);

    // Try multiple patterns to extract video IDs
    const videoIds = new Set();

    // Pattern 1: "videoId":"ID"
    const pattern1 = /"videoId":"([^"]+)"/g;
    let matches = [...html.matchAll(pattern1)];
    console.log(`Pattern 1 matches: ${matches.length}`);
    matches.forEach(match => videoIds.add(match[1]));

    // Pattern 2: /watch?v=ID in links
    const pattern2 = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    matches = [...html.matchAll(pattern2)];
    console.log(`Pattern 2 matches: ${matches.length}`);
    matches.forEach(match => videoIds.add(match[1]));

    // Pattern 3: "videoId": "ID" (with spaces)
    const pattern3 = /"videoId"\s*:\s*"([^"]+)"/g;
    matches = [...html.matchAll(pattern3)];
    console.log(`Pattern 3 matches: ${matches.length}`);
    matches.forEach(match => videoIds.add(match[1]));

    console.log(`\nTotal unique video IDs extracted: ${videoIds.size}`);

    // Convert to full URLs
    const videoUrls = Array.from(videoIds).map(id => `https://www.youtube.com/watch?v=${id}`);

    // Check if the specific video is in the list
    const targetVideo = 'eVgt2ixuY7U';
    const foundTarget = videoIds.has(targetVideo);
    console.log(`\nLooking for video ID: ${targetVideo}`);
    console.log(`Found in results: ${foundTarget ? 'YES ✅' : 'NO ❌'}`);

    // Show all video URLs
    console.log('\nAll videos found:');
    videoUrls.forEach((url, idx) => {
      const isTarget = url.includes(targetVideo);
      console.log(`${idx + 1}. ${url}${isTarget ? ' ← TARGET VIDEO' : ''}`);
    });

    return videoUrls;
  } catch (error) {
    console.error(`Error fetching channel:`, error.message);
    return [];
  }
}

// Test with LittleDarkFury's channel
const channelUrl = 'https://www.youtube.com/@LittleDarkFury';

console.log('Testing LittleDarkFury channel scan...\n');
fetchChannelVideos(channelUrl)
  .then(videos => {
    console.log(`\n\nFinal result: Found ${videos.length} videos`);
  })
  .catch(console.error);
