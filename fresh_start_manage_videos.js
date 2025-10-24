const fs = require('fs');

console.log('Creating fresh Manage Videos tab by copying Matchup Queue...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Step 1: Find and extract the entire Matchup Queue section
const matchupStart = content.indexOf('{/* Matchup Queue Tab */}');
if (matchupStart === -1) {
  console.log('❌ Could not find Matchup Queue tab');
  process.exit(1);
}

// Find the closing of matchupQueue conditional
let searchFrom = matchupStart;
let foundAdminTab = false;
let braceDepth = 0;
let matchupEnd = -1;

for (let i = searchFrom; i < content.length; i++) {
  if (content.substring(i, i + 35).includes("adminTab === 'matchupQueue'")) {
    foundAdminTab = true;
    // Find the opening paren after &&
    const openParen = content.indexOf('(', i);
    braceDepth = 1;
    i = openParen;
    continue;
  }

  if (foundAdminTab) {
    if (content[i] === '(') braceDepth++;
    if (content[i] === ')') {
      braceDepth--;
      if (braceDepth === 0 && content[i + 1] === '}') {
        matchupEnd = i + 2;
        break;
      }
    }
  }
}

if (matchupEnd === -1) {
  console.log('❌ Could not find Matchup Queue end');
  process.exit(1);
}

const matchupQueueCode = content.substring(matchupStart, matchupEnd);
console.log('✅ Extracted Matchup Queue section (', matchupQueueCode.length, 'characters)');

// Step 2: Create Manage Videos version by replacing matchupQueue with manageVideos
let manageVideosCode = matchupQueueCode;

// Replace all occurrences
manageVideosCode = manageVideosCode.replace(/Matchup Queue/g, 'Manage Videos');
manageVideosCode = manageVideosCode.replace(/matchupQueue/g, 'manageVideos');
manageVideosCode = manageVideosCode.replace(/matchupResources/g, 'allResources');
manageVideosCode = manageVideosCode.replace(/fetchMatchupResources/g, 'fetchAllResources');

// Update the description
manageVideosCode = manageVideosCode.replace(
  /Resources that need matchup information.*?<br \/>• Gameplay videos with no matchup chapters at all/s,
  'View and edit all resources sorted by newest first'
);

// Remove the matchup-specific logic (missing matchups, gameplay checks, etc.)
// Simplify the styling - no conditional backgroundColor
manageVideosCode = manageVideosCode.replace(
  /backgroundColor: isGameplayWithNoMatchups \? '#fff8dc' : '#fff3cd'/g,
  "backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'"
);

// Remove the matchup-specific variables in the map
manageVideosCode = manageVideosCode.replace(
  /const missingMatchups = .*?;[\s\S]*?const isGameplayWithNoMatchups = .*?;[\s\n\r]*/,
  ''
);

console.log('✅ Created Manage Videos version');

// Step 3: Delete old Manage Resources section
const manageResourcesStart = content.indexOf('{/* Manage Resources Tab */}');
if (manageResourcesStart === -1) {
  console.log('⚠️  No Manage Resources tab found to delete');
} else {
  // Find end of Manage Resources
  let mrSearchFrom = manageResourcesStart;
  let mrFoundAdminTab = false;
  let mrBraceDepth = 0;
  let manageResourcesEnd = -1;

  for (let i = mrSearchFrom; i < content.length; i++) {
    if (content.substring(i, i + 40).includes("adminTab === 'manageResources'")) {
      mrFoundAdminTab = true;
      const openParen = content.indexOf('(', i);
      mrBraceDepth = 1;
      i = openParen;
      continue;
    }

    if (mrFoundAdminTab) {
      if (content[i] === '(') mrBraceDepth++;
      if (content[i] === ')') {
        mrBraceDepth--;
        if (mrBraceDepth === 0 && content[i + 1] === '}') {
          manageResourcesEnd = i + 2;
          break;
        }
      }
    }
  }

  if (manageResourcesEnd > manageResourcesStart) {
    const before = content.substring(0, manageResourcesStart);
    const after = content.substring(manageResourcesEnd);
    content = before + manageVideosCode + after;
    console.log('✅ Replaced Manage Resources with Manage Videos');
  } else {
    console.log('⚠️  Could not find Manage Resources end, appending instead');
    content = content.substring(0, manageResourcesStart) + manageVideosCode + content.substring(manageResourcesStart);
  }
}

fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\\n✅ Done! Manage Videos tab created as exact copy of working Matchup Queue.');
console.log('Now we need to update the tab button...');
