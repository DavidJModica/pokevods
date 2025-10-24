/**
 * Convert timestamp to seconds for sorting and URL generation
 * @param {string} timestamp - Timestamp in format HH:MM:SS or MM:SS
 * @returns {number} - Seconds
 */
export const timestampToSeconds = (timestamp) => {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

/**
 * Create YouTube timestamped URL
 * @param {string} videoUrl - YouTube video URL
 * @param {string} timestamp - Timestamp in format HH:MM:SS or MM:SS
 * @returns {string} - URL with timestamp parameter
 */
export const getYouTubeTimestampedURL = (videoUrl, timestamp) => {
  const seconds = timestampToSeconds(timestamp);
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    return `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}t=${seconds}`;
  }
  return videoUrl;
};
