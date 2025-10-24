import { timestampToSeconds } from './youtube';

/**
 * Sort chapters by timestamp
 * @param {Array} chapters - Array of chapter objects with timestamp property
 * @returns {Array} - Sorted array of chapters
 */
export const sortChaptersByTime = (chapters) => {
  return [...chapters].sort((a, b) => {
    return timestampToSeconds(a.timestamp) - timestampToSeconds(b.timestamp);
  });
};
