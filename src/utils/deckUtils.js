/**
 * Normalizes deck names for matching by removing common variations
 * @param {string} name - Deck name to normalize
 * @returns {string} Normalized deck name
 */
export const normalizeForMatching = (name) => {
  return name.toLowerCase()
    .replace(/\s+ex\b/g, '') // Remove " ex" suffix
    .replace(/\b(ethan's|misty's|rocket's|iono's|lillie's)\s+/gi, '') // Remove trainer prefixes
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

/**
 * Sorts decks by resource count (descending)
 * @param {Array} decks - Array of deck objects
 * @returns {Array} Sorted array of decks
 */
export const sortDecksByResourceCount = (decks) => {
  return [...decks].sort((a, b) => {
    const aCount = a.resources?.length || 0;
    const bCount = b.resources?.length || 0;
    return bCount - aCount;
  });
};
