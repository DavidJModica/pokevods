const fs = require('fs');

console.log('Adding setAllResources([]) to tab button onClick...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Find the exact pattern for the tab button onClick
const oldPattern = `              onClick={() => {
                setAdminTab('manageResources');
                fetchAllResources();
              }}`;

const newPattern = `              onClick={() => {
                setAllResources([]);  // Clear first to trigger re-render
                setAdminTab('manageResources');
                fetchAllResources();
              }}`;

if (content.includes(oldPattern)) {
  content = content.replace(oldPattern, newPattern);
  console.log('✅ Added setAllResources([]) before fetchAllResources()');
  fs.writeFileSync('src/App.js', content, 'utf8');
  console.log('\\n✅ Done! This matches the working Refresh button pattern.');
} else {
  console.log('⚠️  Could not find exact pattern');
}
