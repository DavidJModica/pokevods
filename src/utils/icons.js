/**
 * Get platform icon emoji
 * @param {string} platform - Platform name
 * @returns {string} - Emoji icon for the platform
 */
export const getPlatformIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'youtube': return '📺';
    case 'limitlesstcg': return '🎮';
    case 'pokebeach': return '🏖️';
    case 'twitch': return '💜';
    default: return '🌐';
  }
};
