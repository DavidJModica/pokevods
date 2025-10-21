// HTML Sanitization utility to prevent XSS attacks
// Uses DOMPurify to clean user-generated HTML content

const DOMPurify = require('isomorphic-dompurify');

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Potentially unsafe HTML string
 * @param {object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string safe for rendering
 */
function sanitizeHTML(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Default configuration - allows common formatting but blocks scripts
  const defaultConfig = {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup', 'mark',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Links and media
      'a', 'img',
      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Blockquotes and code
      'blockquote', 'code', 'pre',
      // Divs and spans for styling
      'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',  // Links
      'src', 'alt', 'width', 'height',  // Images
      'class', 'id',  // Styling
      'data-*'  // Data attributes
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    ...options
  };

  try {
    const clean = DOMPurify.sanitize(dirty, defaultConfig);
    return clean;
  } catch (error) {
    console.error('HTML sanitization error:', error);
    // On error, return empty string for safety
    return '';
  }
}

/**
 * Sanitize guide section content
 * Specifically for Pokemon TCG guides with TipTap editor output
 */
function sanitizeGuideContent(content) {
  return sanitizeHTML(content, {
    // Additional allowed tags for rich guide content
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup', 'mark',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'code', 'pre',
      'div', 'span',
      // TipTap specific
      'hr'
    ],
    // Ensure external links open in new tab and have noopener
    HOOKS: {
      afterSanitizeAttributes: (node) => {
        if (node.tagName === 'A') {
          const href = node.getAttribute('href');
          if (href && !href.startsWith('/') && !href.startsWith('#')) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
          }
        }
      }
    }
  });
}

/**
 * Sanitize plain text input (removes all HTML)
 */
function sanitizePlainText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Strip all HTML tags
  const clean = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });

  return clean.trim();
}

module.exports = {
  sanitizeHTML,
  sanitizeGuideContent,
  sanitizePlainText
};
