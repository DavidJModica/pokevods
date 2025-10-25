import { MEGA_EVOLUTIONS_FORMAT_DATE } from '../constants';

/**
 * Formats a publication date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatPublicationDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

/**
 * Formats a date for HTML date input (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Checks if a resource is out of date (before Mega Evolutions format)
 * @param {Object} resource - Resource object with publicationDate
 * @returns {boolean} True if out of date
 */
export const isResourceOutOfDate = (resource) => {
  if (!resource?.publicationDate) return false;
  return new Date(resource.publicationDate) < MEGA_EVOLUTIONS_FORMAT_DATE;
};
