/**
 * Generates a URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Case-insensitive string includes check
 * @param {string} str - String to search in
 * @param {string} searchTerm - Term to search for
 * @returns {boolean} True if found (case-insensitive)
 */
export const includesIgnoreCase = (str, searchTerm) => {
  if (!str || !searchTerm) return false;
  return str.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Filters an array of objects by searching multiple string fields
 * @param {Array} items - Array of objects to filter
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} Filtered items
 */
export const filterByMultipleFields = (items, searchTerm, fields) => {
  if (!searchTerm) return items;
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return value && value.toLowerCase().includes(lowerSearch);
    })
  );
};
