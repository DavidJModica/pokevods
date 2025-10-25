// Resource Types
export const RESOURCE_TYPES = {
  GUIDE: 'Guide',
  GAMEPLAY: 'Gameplay',
  GUIDE_AND_GAMEPLAY: 'Guide and Gameplay',
  DISCUSSION: 'Discussion',
  TOURNAMENT_REPORT: 'Tournament Report',
  TIERLIST: 'Tierlist',
  FUNDAMENTALS: 'Fundamentals',
  METAGAME_DISCUSSION: 'Metagame Discussion',
  HOSTED_GUIDE: 'Hosted Guide'
};

// Platforms
export const PLATFORMS = {
  YOUTUBE: 'YouTube',
  METAFY: 'Metafy',
  REDDIT: 'Reddit',
  POKEVODS_HOSTED: 'PokeVods Hosted',
  OTHER: 'Other'
};

// Access Types
export const ACCESS_TYPES = {
  FREE: 'Free',
  PAID: 'Paid'
};

// Chapter Types
export const CHAPTER_TYPES = {
  GUIDE: 'Guide',
  MATCHUP: 'Matchup'
};

// Formats
export const FORMATS = {
  STANDARD: 'Standard',
  EXPANDED: 'Expanded',
  UNLIMITED: 'Unlimited'
};

// Status
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved'
};

// Important Dates
export const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

// Default Filter States
export const DEFAULT_RESOURCE_TYPE_FILTERS = {
  [RESOURCE_TYPES.GUIDE]: true,
  [RESOURCE_TYPES.GAMEPLAY]: true,
  [RESOURCE_TYPES.GUIDE_AND_GAMEPLAY]: true,
  [RESOURCE_TYPES.DISCUSSION]: true,
  [RESOURCE_TYPES.TOURNAMENT_REPORT]: true,
  [RESOURCE_TYPES.TIERLIST]: true,
  [RESOURCE_TYPES.FUNDAMENTALS]: true,
  [RESOURCE_TYPES.METAGAME_DISCUSSION]: true
};

export const DEFAULT_ACCESS_TYPE_FILTERS = {
  [ACCESS_TYPES.FREE]: true,
  [ACCESS_TYPES.PAID]: true
};

export const DEFAULT_PLATFORM_FILTERS = {
  [PLATFORMS.YOUTUBE]: true,
  [PLATFORMS.METAFY]: true,
  [PLATFORMS.OTHER]: true
};

// Version
export const APP_VERSION = '0.1.21';
