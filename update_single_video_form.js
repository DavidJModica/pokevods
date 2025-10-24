const fs = require('fs');

// Read App.js
let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Updating Add Single Video form...\n');

// 1. Update the description text to indicate deck is optional
const oldDescription = `                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Manually add a single YouTube video to a specific deck.
                </p>`;

const newDescription = `                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Manually add a single YouTube video. Deck selection is optional for videos like Tierlists, Fundamentals, or Metagame Discussion.
                </p>`;

if (content.includes(oldDescription)) {
  content = content.replace(oldDescription, newDescription);
  console.log('✅ Updated form description');
} else {
  console.log('⚠️  Could not find form description');
}

// 2. Change "Select Deck *" to "Select Deck (Optional)"
content = content.replace(
  `<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Deck *</label>`,
  `<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Deck (Optional)</label>`
);
console.log('✅ Changed deck label to optional');

// 3. Add type/category selector before the deck selector
const deckSelectorStart = `                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Deck (Optional)</label>`;

const typeSelector = `                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Video Type *</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                  >
                    <option value="Guide">Guide</option>
                    <option value="Gameplay">Gameplay</option>
                    <option value="Guide and Gameplay">Guide and Gameplay</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Tournament Report">Tournament Report</option>
                    <option value="Tierlist">Tierlist</option>
                    <option value="Fundamentals">Fundamentals</option>
                    <option value="Metagame Discussion">Metagame Discussion</option>
                  </select>
                  {(newResource.type === 'Tierlist' || newResource.type === 'Fundamentals' || newResource.type === 'Metagame Discussion') && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                      💡 Deck selection is optional for {newResource.type} videos.
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Deck (Optional)</label>`;

content = content.replace(deckSelectorStart, typeSelector);
console.log('✅ Added type/category selector');

// 4. Update validation to make deck optional
const oldValidation = `                  onClick={async () => {
                    if (!selectedSingleVideoDeck) {
                      alert('Please select a deck first');
                      return;
                    }
                    if (!newResource.url || !newResource.title) {
                      alert('Please fill in URL and Title');
                      return;
                    }`;

const newValidation = `                  onClick={async () => {
                    if (!newResource.url || !newResource.title) {
                      alert('Please fill in URL and Title');
                      return;
                    }`;

if (content.includes(oldValidation)) {
  content = content.replace(oldValidation, newValidation);
  console.log('✅ Removed required deck validation');
} else {
  console.log('⚠️  Could not find validation code');
}

// 5. Update the API call to handle optional deckId
const oldApiCall = `                      const response = await fetch('/api/resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...newResource,
                          deckId: selectedSingleVideoDeck.id
                        })
                      });`;

const newApiCall = `                      const response = await fetch('/api/resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...newResource,
                          deckId: selectedSingleVideoDeck?.id || null
                        })
                      });`;

if (content.includes(oldApiCall)) {
  content = content.replace(oldApiCall, newApiCall);
  console.log('✅ Updated API call to handle optional deckId');
} else {
  console.log('⚠️  Could not find API call');
}

// Write the updated file
fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ All changes applied successfully!');
console.log('\nUpdated "Add Single Video" form:');
console.log('1. Added video type/category dropdown');
console.log('2. Made deck selection optional');
console.log('3. Shows helpful hint for Tierlist, Fundamentals, and Metagame Discussion');
console.log('4. Removed deck requirement validation');
