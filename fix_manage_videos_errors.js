const fs = require('fs');

console.log('Fixing build errors in Manage Videos tab...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Fix 1: Add index parameter to map function
content = content.replace(
  'allResources.map(resource => {',
  'allResources.map((resource, index) => {'
);
console.log('✅ Added index parameter to map');

// Fix 2: Remove the entire isGameplayWithNoMatchups conditional section (lines 4514-4532)
// Replace with simple info display
const oldConditional = /\{isGameplayWithNoMatchups \? \([\s\S]*?\) : \([\s\S]*?\)\}/;
const newSimple = `<div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            <strong>Author:</strong> {resource.authorProfile?.name || resource.author || 'Unknown'} | <strong>Platform:</strong> {resource.platform || 'Unknown'}
                          </div>`;

content = content.replace(oldConditional, newSimple);
console.log('✅ Removed matchup-specific conditional');

// Fix 3: Change button text from conditional to simple "Edit"
content = content.replace(
  "{isGameplayWithNoMatchups ? '➕ Add Matchup Chapters' : '✏️ Edit & Assign Matchups'}",
  "'✏️ Edit'"
);
console.log('✅ Simplified Edit button text');

// Fix 4: Change "No matchups need review!" to "No resources found!"
content = content.replace(
  'No matchups need review!',
  'No resources found!'
);
console.log('✅ Updated empty state message');

fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\\n✅ All build errors fixed!');
console.log('Manage Videos tab is now clean without matchup-specific code.');
