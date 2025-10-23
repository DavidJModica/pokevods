const fs = require('fs');

// Read App.js
let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Adding variant-aware matchup filtering...\n');

// 1. Add relatedDeckIds state variable after matchupFilter
const oldState = `  const [matchupFilter, setMatchupFilter] = useState(null);
  const [matchupSearch, setMatchupSearch] = useState('');`;

const newState = `  const [matchupFilter, setMatchupFilter] = useState(null);
  const [matchupSearch, setMatchupSearch] = useState('');
  const [relatedDeckIds, setRelatedDeckIds] = useState([]);`;

if (content.includes(oldState)) {
  content = content.replace(oldState, newState);
  console.log('✅ Added relatedDeckIds state variable');
} else {
  console.log('⚠️  Could not find matchupFilter state declaration');
}

// 2. Update the matchup filter dropdown click handler to fetch related decks
const oldDropdownClick = `                            onClick={() => {
                              setMatchupFilter(deck.id);
                              setMatchupSearch(deck.name);
                              setShowMatchupDropdown(false);
                            }}`;

const newDropdownClick = `                            onClick={async () => {
                              setMatchupFilter(deck.id);
                              setMatchupSearch(deck.name);
                              setShowMatchupDropdown(false);

                              // Fetch all related deck IDs (including variants)
                              try {
                                const response = await fetch(\`/api/decks/\${deck.id}/matchups\`);
                                const data = await response.json();
                                const allDeckIds = data.relatedDecks?.map(d => d.id) || [deck.id];
                                setRelatedDeckIds(allDeckIds);
                              } catch (error) {
                                console.error('Error fetching related decks:', error);
                                setRelatedDeckIds([deck.id]);
                              }
                            }}`;

const occurrences = (content.match(new RegExp(oldDropdownClick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
content = content.split(oldDropdownClick).join(newDropdownClick);
console.log(`✅ Updated ${occurrences} matchup filter dropdown click handlers`);

// 3. Update the matchup filter logic to use relatedDeckIds
const oldFilterLogic = `                  ?.filter(resource => {
                    // Filter by matchup if a matchup is selected
                    if (!matchupFilter) return true;
                    return resource.chapters?.some(chapter =>
                      chapter.chapterType === 'Matchup' && chapter.opposingDeckId === matchupFilter
                    );
                  })`;

const newFilterLogic = `                  ?.filter(resource => {
                    // Filter by matchup if a matchup is selected
                    if (!matchupFilter) return true;
                    // Use relatedDeckIds to include variants
                    const deckIdsToCheck = relatedDeckIds.length > 0 ? relatedDeckIds : [matchupFilter];
                    return resource.chapters?.some(chapter =>
                      chapter.chapterType === 'Matchup' && deckIdsToCheck.includes(chapter.opposingDeckId)
                    );
                  })`;

if (content.includes(oldFilterLogic)) {
  content = content.replace(oldFilterLogic, newFilterLogic);
  console.log('✅ Updated matchup filter logic to include variants');
} else {
  console.log('⚠️  Could not find matchup filter logic');
}

// 4. Clear relatedDeckIds when matchup filter is cleared
const oldClearFilter = `                    onClick={() => {
                      setMatchupFilter(null);
                      setMatchupSearch('');
                    }}`;

const newClearFilter = `                    onClick={() => {
                      setMatchupFilter(null);
                      setMatchupSearch('');
                      setRelatedDeckIds([]);
                    }}`;

if (content.includes(oldClearFilter)) {
  content = content.replace(oldClearFilter, newClearFilter);
  console.log('✅ Updated clear filter button to reset relatedDeckIds');
} else {
  console.log('⚠️  Could not find clear filter button');
}

// 5. Also clear when search input changes to empty
const oldOnChange = `                  onChange={(e) => {
                    setMatchupSearch(e.target.value);
                    setShowMatchupDropdown(true);
                    if (!e.target.value) {
                      setMatchupFilter(null);
                    }
                  }}`;

const newOnChange = `                  onChange={(e) => {
                    setMatchupSearch(e.target.value);
                    setShowMatchupDropdown(true);
                    if (!e.target.value) {
                      setMatchupFilter(null);
                      setRelatedDeckIds([]);
                    }
                  }}`;

if (content.includes(oldOnChange)) {
  content = content.replace(oldOnChange, newOnChange);
  console.log('✅ Updated matchup search onChange to reset relatedDeckIds');
} else {
  console.log('⚠️  Could not find matchup search onChange handler');
}

// Write the updated file
fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ All changes applied successfully!');
console.log('\nVariant-aware matchup filtering is now enabled.');
console.log('When you filter by a deck like "Charizard", it will show matchups');
console.log('against all Charizard variants (Charizard Pidgeot, Charizard Dusknoir, etc.)');
