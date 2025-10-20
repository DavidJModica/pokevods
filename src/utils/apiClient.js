/**
 * API Client utility for making authenticated requests
 */

/**
 * Get the stored admin token from sessionStorage
 * @returns {string|null} The JWT token or null if not logged in
 */
export function getAuthToken() {
  return sessionStorage.getItem('adminToken');
}

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} The fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  const headers = {
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON bodies
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  return getAuthToken() !== null;
}

/**
 * Clear authentication (logout)
 */
export function clearAuth() {
  sessionStorage.removeItem('adminToken');
}
