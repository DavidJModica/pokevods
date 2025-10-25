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

/**
 * Safely parses deck icons from JSON string
 * @param {Object} deck - Deck object with icons property
 * @returns {Array} Array of icon strings
 */
export const parseIconsArray = (deck) => {
  if (!deck) return [];
  if (deck.icons) {
    try {
      const parsed = JSON.parse(deck.icons);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  if (deck.icon) return [deck.icon];
  return [];
};
