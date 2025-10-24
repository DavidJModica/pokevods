const fs = require('fs');

console.log('Adding visible render counter for debugging...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Add render counter display to Manage Resources header
const oldHeader = `            <h2 style={{ margin: 0 }}>Manage All Resources ({allResources.length})</h2>`;
const newHeader = `            <h2 style={{ margin: 0 }}>Manage All Resources ({allResources.length}) - Renders: {renderCount}</h2>`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  console.log('✅ Added render counter to header');
  fs.writeFileSync('src/App.js', content, 'utf8');
  console.log('\\n✅ Done! You will see "Renders: X" in the Manage Resources header.');
  console.log('This will tell us if React is re-rendering when state changes.');
} else {
  console.log('⚠️  Could not find header pattern');
}
