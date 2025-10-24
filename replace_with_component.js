const fs = require('fs');

console.log('Replacing Manage Resources inline content with component...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Find the start of Manage Resources tab
const startPattern = '      {/* Manage Resources Tab */}';
const startIndex = content.indexOf(startPattern);

if (startIndex === -1) {
  console.log('❌ Could not find Manage Resources tab start');
  process.exit(1);
}

console.log('✅ Found tab start at index', startIndex);

// Find the end - look for the closing of this tab section
// It should end with "      )}" before the next tab or section
// Let's find from startIndex forward to the next major section

// The pattern should be the entire tab wrapped in {adminTab === 'manageResources' && ( ... )}
// We need to find the matching closing )}

let braceCount = 0;
let inTab = false;
let endIndex = -1;

for (let i = startIndex; i < content.length; i++) {
  const char = content[i];
  const nextChar = content[i + 1];

  // Check if we're entering the conditional
  if (!inTab && content.substring(i, i + 30).includes("adminTab === 'manageResources'")) {
    // Find the opening ( after &&
    const openParen = content.indexOf('(', i);
    if (openParen !== -1) {
      inTab = true;
      braceCount = 1;
      i = openParen;
      continue;
    }
  }

  if (inTab) {
    if (char === '(') braceCount++;
    if (char === ')') {
      braceCount--;
      if (braceCount === 0) {
        // Found the closing ), now look for the }
        if (content[i + 1] === '}') {
          endIndex = i + 2;
          break;
        }
      }
    }
  }
}

if (endIndex === -1) {
  console.log('❌ Could not find tab end');
  process.exit(1);
}

console.log('✅ Found tab end at index', endIndex);

// Extract everything before and after
const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

// Create the replacement
const replacement = `      {/* Manage Resources Tab */}
      <ManageResources
        isActive={adminTab === 'manageResources'}
        allResources={allResources}
        setAllResources={setAllResources}
        fetchAllResources={fetchAllResources}
        setEditingResource={setEditingResource}
        setEditDeckSearch={setEditDeckSearch}
        setShowEditDeckDropdown={setShowEditDeckDropdown}
        decks={decks}
      />`;

// Combine
const newContent = before + replacement + after;

fs.writeFileSync('src/App.js', newContent, 'utf8');

console.log('\\n✅ Replaced inline content with ManageResources component!');
console.log('The component has its own rendering lifecycle and will update independently.');
