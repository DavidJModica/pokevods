const fs = require('fs');

console.log('Moving Guide Videos section to correct location...');

// Read the file
const content = fs.readFileSync('src/App.js', 'utf8');
const lines = content.split('\n');

// Find Guide Videos section (lines 4460-4524, but 0-indexed so 4459-4523)
const guideVideosStart = 4459;  // Line 4460 in editor
const guideVideosEnd = 4524;    // Line 4525 in editor (exclusive)

// Extract Guide Videos section
const guideVideosSection = lines.slice(guideVideosStart, guideVideosEnd);

// Remove Guide Videos from wrong location
const linesBeforeGuideVideos = lines.slice(0, guideVideosStart);
const linesAfterGuideVideos = lines.slice(guideVideosEnd);

// Find insertion point (after line 3885, which is index 3884)
const insertionPoint = 3885;

// Reconstruct file with Guide Videos in correct location
const newLines = [
  ...linesBeforeGuideVideos.slice(0, insertionPoint),
  '',  // Add blank line
  ...guideVideosSection,
  ...linesBeforeGuideVideos.slice(insertionPoint),
  ...linesAfterGuideVideos
];

// Write back to file
fs.writeFileSync('src/App.js', newLines.join('\n'), 'utf8');

console.log('✅ Successfully moved Guide Videos section to correct location');
console.log(`   Moved from line ${guideVideosStart + 1} to line ${insertionPoint + 1}`);
