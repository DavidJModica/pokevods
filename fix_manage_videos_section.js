const fs = require('fs');

console.log('Fixing Manage Videos section (second occurrence)...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Find the Manage Videos tab section
const manageVideosStart = content.indexOf('{/* Manage Videos Tab */}');
if (manageVideosStart === -1) {
  console.log('❌ Could not find Manage Videos tab');
  process.exit(1);
}

console.log('✅ Found Manage Videos at index', manageVideosStart);

// Extract from Manage Videos to end of file
const fromManageVideos = content.substring(manageVideosStart);

// Replace all matchup-specific issues in this section ONLY
let fixedSection = fromManageVideos;

// Replace the entire conditional block lines 4498-4516 with simple author/platform display
fixedSection = fixedSection.replace(
  /\{isGameplayWithNoMatchups \? \([\s\S]*?<\/div>\s*\) : \([\s\S]*?\{missingMatchups\.map[\s\S]*?\)\}\s*<\/div>\s*\)\s*\}\s*<\/div>/,
  `<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            <strong>Author:</strong> {resource.authorProfile?.name || resource.author || 'Unknown'} | <strong>Platform:</strong> {resource.platform || 'Unknown'}
                          </div>
                        </div>`
);

// Replace conditional button text
fixedSection = fixedSection.replace(
  /\{isGameplayWithNoMatchups \? '➕ Add Matchup Chapters' : '✏️ Edit & Assign Matchups'\}/g,
  '✏️ Edit'
);

// Reconstruct file
const before = content.substring(0, manageVideosStart);
const newContent = before + fixedSection;

fs.writeFileSync('src/App.js', newContent, 'utf8');

console.log('\\n✅ Fixed Manage Videos section!');
console.log('Removed all matchup-specific code from Manage Videos tab.');
