/**
 * API Service Layer
 * Centralized location for all API calls
 */

// ========================================
// INITIAL DATA
// ========================================

export const fetchInitialData = async () => {
  const response = await fetch('/api/initial-data');
  if (!response.ok) throw new Error('Failed to fetch initial data');
  return response.json();
};

// ========================================
// DECKS
// ========================================

export const fetchDecks = async () => {
  const response = await fetch('/api/decks');
  if (!response.ok) throw new Error('Failed to fetch decks');
  return response.json();
};

export const fetchDeckById = async (id) => {
  const response = await fetch(`/api/decks?id=${id}`);
  if (!response.ok) throw new Error(`Failed to fetch deck ${id}`);
  return response.json();
};

export const fetchDeckMatchups = async (id) => {
  const response = await fetch(`/api/deck-matchups?id=${id}`);
  if (!response.ok) throw new Error(`Failed to fetch deck matchups for ${id}`);
  return response.json();
};

export const createDeck = async (deckData) => {
  const response = await fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deckData)
  });
  if (!response.ok) throw new Error('Failed to create deck');
  return response.json();
};

export const updateDeck = async (deckData) => {
  const response = await fetch('/api/decks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deckData)
  });
  if (!response.ok) throw new Error('Failed to update deck');
  return response.json();
};

// ========================================
// RESOURCES
// ========================================

export const fetchResourcesByType = async (type) => {
  const response = await fetch(`/api/resources?type=${encodeURIComponent(type)}`);
  if (!response.ok) throw new Error(`Failed to fetch ${type} resources`);
  return response.json();
};

export const fetchResourcesByAccessType = async (accessType) => {
  const response = await fetch(`/api/resources?accessType=${accessType}`);
  if (!response.ok) throw new Error(`Failed to fetch ${accessType} resources`);
  return response.json();
};

export const fetchPendingResources = async () => {
  const response = await fetch('/api/resources?status=pending');
  if (!response.ok) throw new Error('Failed to fetch pending resources');
  return response.json();
};

export const fetchGuideVideos = async () => {
  const response = await fetch('/api/guide-videos');
  if (!response.ok) throw new Error('Failed to fetch guide videos');
  return response.json();
};

export const createResource = async (resourceData) => {
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData)
  });
  if (!response.ok) throw new Error('Failed to create resource');
  return response.json();
};

export const updateResource = async (resourceData) => {
  const response = await fetch('/api/resources', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resourceData)
  });
  if (!response.ok) throw new Error('Failed to update resource');
  return response.json();
};

export const deleteResource = async (resourceId) => {
  const response = await fetch(`/api/resources?id=${resourceId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete resource');
  return response.ok;
};

// ========================================
// CHAPTERS
// ========================================

export const createChapter = async (chapterData) => {
  const response = await fetch('/api/chapters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chapterData)
  });
  if (!response.ok) throw new Error('Failed to create chapter');
  return response.json();
};

export const updateChapter = async (chapterId, chapterData) => {
  const response = await fetch(`/api/chapters?id=${chapterId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chapterData)
  });
  if (!response.ok) throw new Error('Failed to update chapter');
  return response.json();
};

export const deleteChapter = async (chapterId) => {
  const response = await fetch(`/api/chapters?id=${chapterId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete chapter');
  return response.ok;
};

// ========================================
// AUTHORS
// ========================================

export const fetchAuthors = async () => {
  const response = await fetch('/api/authors');
  if (!response.ok) throw new Error('Failed to fetch authors');
  return response.json();
};

export const fetchAuthorBySlug = async (slug) => {
  const response = await fetch(`/api/authors?slug=${slug}`);
  if (!response.ok) throw new Error(`Failed to fetch author ${slug}`);
  return response.json();
};

export const createAuthor = async (authorData) => {
  const response = await fetch('/api/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authorData)
  });
  if (!response.ok) throw new Error('Failed to create author');
  return response.json();
};

export const updateAuthor = async (authorData) => {
  const response = await fetch('/api/authors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authorData)
  });
  if (!response.ok) throw new Error('Failed to update author');
  return response.json();
};

// ========================================
// YOUTUBE
// ========================================

export const fetchYouTubeData = async (url) => {
  const response = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('Failed to fetch YouTube data');
  return response.json();
};

export const fetchYouTubeMetadata = async (url, deckId) => {
  const response = await fetch('/api/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, deckId })
  });
  if (!response.ok) throw new Error('Failed to fetch YouTube metadata');
  return response.json();
};

// ========================================
// BULK OPERATIONS
// ========================================

export const bulkImport = async (bulkData) => {
  const response = await fetch('/api/bulk-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bulkData)
  });
  if (!response.ok) throw new Error('Failed to bulk import');
  return response.json();
};

export const scanAuthorChannels = async (authorIds) => {
  const response = await fetch('/api/scan-author-channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorIds })
  });
  if (!response.ok) throw new Error('Failed to scan author channels');
  return response.json();
};

// ========================================
// ADMIN / AUTH
// ========================================

export const authenticate = async (password) => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!response.ok) throw new Error('Authentication failed');
  return response.json();
};

export const fetchMatchupQueue = async () => {
  const response = await fetch('/api/matchup-queue');
  if (!response.ok) throw new Error('Failed to fetch matchup queue');
  return response.json();
};
