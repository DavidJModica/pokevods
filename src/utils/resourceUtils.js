import { MEGA_EVOLUTIONS_FORMAT_DATE } from '../constants';

/**
 * Normalizes platform names (treats non-YouTube/Metafy as 'Other')
 * @param {string} platform - Platform name
 * @returns {string} Normalized platform
 */
export const normalizePlatform = (platform) => {
  if (platform === 'YouTube' || platform === 'Metafy') {
    return platform;
  }
  return 'Other';
};

/**
 * Filters resources by multiple criteria
 * @param {Array} resources - Resources to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered resources
 */
export const filterResources = (resources, filters) => {
  const {
    relatedDeckIds,
    matchupFilter,
    resourceTypeFilter,
    accessTypeFilter,
    platformFilter,
    showOutOfDate
  } = filters;

  return resources.filter(resource => {
    // Matchup filter
    if (matchupFilter && relatedDeckIds?.length > 0) {
      const hasMatchingChapter = resource.chapters?.some(chapter =>
        chapter.chapterType === 'Matchup' &&
        chapter.opposingDeckId &&
        relatedDeckIds.includes(chapter.opposingDeckId)
      );
      if (!hasMatchingChapter) return false;
    }

    // Resource type filter
    if (resourceTypeFilter && !resourceTypeFilter[resource.type]) {
      return false;
    }

    // Access type filter
    if (accessTypeFilter && !accessTypeFilter[resource.accessType]) {
      return false;
    }

    // Platform filter
    const normalizedPlatform = normalizePlatform(resource.platform);
    if (platformFilter && !platformFilter[normalizedPlatform]) {
      return false;
    }

    // Out of date filter
    if (!showOutOfDate && resource.publicationDate) {
      if (new Date(resource.publicationDate) < MEGA_EVOLUTIONS_FORMAT_DATE) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Gets unique decks from resource chapters
 * @param {Array} chapters - Chapter array from resource
 * @returns {Array} Unique decks with id and name
 */
export const getUniqueDeckMatchups = (chapters) => {
  if (!chapters || chapters.length === 0) return [];

  const matchupChapters = chapters.filter(
    chapter => chapter.chapterType === 'Matchup' && chapter.opposingDeck
  );

  const deckMap = new Map();
  matchupChapters.forEach(chapter => {
    if (!deckMap.has(chapter.opposingDeck.id)) {
      deckMap.set(chapter.opposingDeck.id, {
        id: chapter.opposingDeck.id,
        name: chapter.opposingDeck.name
      });
    }
  });

  return [...deckMap.values()];
};

/**
 * Counts resources by status in bulk import results
 * @param {Array} results - Bulk import results
 * @returns {Object} Counts object
 */
export const countBulkImportResults = (results) => {
  return {
    approved: results.filter(r => r.success && r.status === 'approved').length,
    pending: results.filter(r => r.success && r.status === 'pending').length,
    failed: results.filter(r => !r.success).length,
    noDeck: results.filter(r => !r.success && r.needsManualDeck).length
  };
};
