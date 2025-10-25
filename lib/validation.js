/**
 * Input Validation Helpers
 *
 * Centralized validation functions to prevent injection attacks,
 * invalid data, and improve error handling.
 */

/**
 * Validate and parse an ID parameter
 * @param {any} id - The ID to validate (from query params or body)
 * @param {string} fieldName - Name of the field for error messages
 * @returns {number} - Parsed integer ID
 * @throws {Error} - If ID is invalid
 */
function validateId(id, fieldName = 'ID') {
  if (id === undefined || id === null || id === '') {
    throw new Error(`${fieldName} is required`);
  }

  const parsed = parseInt(id);

  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (parsed <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  // Check for extremely large numbers that could cause issues
  if (parsed > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${fieldName} is too large`);
  }

  return parsed;
}

/**
 * Validate and parse an array of IDs
 * @param {any} ids - Array of IDs to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {number[]} - Array of parsed integer IDs
 * @throws {Error} - If any ID is invalid
 */
function validateIds(ids, fieldName = 'IDs') {
  if (!Array.isArray(ids)) {
    throw new Error(`${fieldName} must be an array`);
  }

  if (ids.length === 0) {
    throw new Error(`${fieldName} array cannot be empty`);
  }

  return ids.map((id, index) => {
    try {
      return validateId(id, `${fieldName}[${index}]`);
    } catch (error) {
      throw new Error(`${fieldName}[${index}]: ${error.message}`);
    }
  });
}

/**
 * Validate a string parameter
 * @param {any} value - The string to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {number} options.maxLength - Maximum length
 * @param {number} options.minLength - Minimum length
 * @param {boolean} options.required - Whether the field is required
 * @returns {string|null} - Validated string or null if not required and empty
 * @throws {Error} - If validation fails
 */
function validateString(value, fieldName = 'Field', options = {}) {
  const {
    maxLength = 1000,
    minLength = 0,
    required = false
  } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less`);
  }

  return trimmed;
}

/**
 * Validate a URL
 * @param {any} url - The URL to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {boolean} required - Whether the field is required
 * @returns {string|null} - Validated URL or null if not required and empty
 * @throws {Error} - If validation fails
 */
function validateUrl(url, fieldName = 'URL', required = false) {
  if (!url || url === '') {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof url !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  // Basic URL validation
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`${fieldName} must use HTTP or HTTPS protocol`);
    }

    return url.trim();
  } catch (error) {
    throw new Error(`${fieldName} is not a valid URL`);
  }
}

/**
 * Validate an email address
 * @param {any} email - The email to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {string} - Validated and normalized email (lowercase)
 * @throws {Error} - If validation fails
 */
function validateEmail(email, fieldName = 'Email') {
  if (!email || email === '') {
    throw new Error(`${fieldName} is required`);
  }

  if (typeof email !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    throw new Error(`${fieldName} is not a valid email address`);
  }

  if (trimmed.length > 255) {
    throw new Error(`${fieldName} is too long`);
  }

  return trimmed;
}

/**
 * Validate a number within a range
 * @param {any} value - The number to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {boolean} options.required - Whether the field is required
 * @returns {number|null} - Validated number or null if not required and empty
 * @throws {Error} - If validation fails
 */
function validateNumber(value, fieldName = 'Number', options = {}) {
  const {
    min = -Infinity,
    max = Infinity,
    required = false
  } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return null;
  }

  const parsed = Number(value);

  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (parsed < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (parsed > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }

  return parsed;
}

module.exports = {
  validateId,
  validateIds,
  validateString,
  validateUrl,
  validateEmail,
  validateNumber
};
