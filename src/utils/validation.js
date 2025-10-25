/**
 * Checks if a string is empty or only whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

/**
 * Basic URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
export const isValidUrl = (url) => {
  if (isEmpty(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean} True if YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Checks if URL is a Metafy URL
 * @param {string} url - URL to check
 * @returns {boolean} True if Metafy URL
 */
export const isMetafyUrl = (url) => {
  if (!url) return false;
  return url.includes('metafy.gg');
};
