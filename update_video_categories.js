const fs = require('fs');

// Read the App.js file
let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Making changes to App.js...\n');

// 1. Add 'Fundamentals' to the type filter object (around line 117)
content = content.replace(
  `    'Tournament Report': true,
    'Tierlist': true,
    'Metagame Discussion': true`,
  `    'Tournament Report': true,
    'Tierlist': true,
    'Fundamentals': true,
    'Metagame Discussion': true`
);
console.log('✅ Added Fundamentals to type filter object');

// 2. Add Fundamentals option to all select dropdowns (4 locations)
const oldOptions = `                    <option value="Tournament Report">Tournament Report</option>
                    <option value="Tierlist">Tierlist</option>
                    <option value="Metagame Discussion">Metagame Discussion</option>`;

const newOptions = `                    <option value="Tournament Report">Tournament Report</option>
                    <option value="Tierlist">Tierlist</option>
                    <option value="Fundamentals">Fundamentals</option>
                    <option value="Metagame Discussion">Metagame Discussion</option>`;

const occurrences = (content.match(new RegExp(oldOptions.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
content = content.split(oldOptions).join(newOptions);
console.log(`✅ Added Fundamentals option to ${occurrences} dropdown menus`);

// 3. Update the note about optional deck selection to include Fundamentals
content = content.replace(
  /\(editingResource\.type === 'Tierlist' \|\| editingResource\.type === 'Metagame Discussion'\)/g,
  `(editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion' || editingResource.type === 'Fundamentals')`
);
console.log('✅ Updated deck selection optional note to include Fundamentals');

// 4. Remove Tournament VOD section from homepage (lines 4585-4617)
const tournamentSection = `      {/* Tournament VODs Section */}
      {tournamentResources.length > 0 && (
        <div className="decks-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>🏆 Tournament VODs</h2>
          <div className="decks-list">
            {tournamentResources.map(resource => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="deck-list-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="deck-list-info">
                  <span className="deck-list-name">
                    {resource.deck?.name && (
                      <span style={{ color: '#28a745', fontWeight: 'bold', marginRight: '0.5rem' }}>
                        {resource.deck.name}
                      </span>
                    )}
                    {resource.title}
                  </span>
                  <span className="deck-list-meta">
                    {resource.authorProfile?.name || resource.author}
                    {resource.publicationDate && \` • \${new Date(resource.publicationDate).toLocaleDateString()}\`}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

`;

if (content.includes(tournamentSection)) {
  content = content.replace(tournamentSection, '');
  console.log('✅ Removed Tournament VODs section from homepage');
} else {
  console.log('⚠️  Tournament VODs section not found (may have been already removed)');
}

// Write the updated content back
fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ All changes applied successfully!');
console.log('\nSummary:');
console.log('1. Added "Fundamentals" video category');
console.log('2. Removed Tournament VOD section from homepage');
console.log('3. Made deck selection optional for Fundamentals videos');
