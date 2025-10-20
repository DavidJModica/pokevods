const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/App.js', 'utf8');

// Step 1: Add state variables for Metafy guide form after the singleVideoDeckSearch state
const metafyStates = `  const [metafyGuide, setMetafyGuide] = useState({
    title: '',
    url: '',
    author: '',
    deckId: null,
    publicationDate: '',
    price: ''
  });
  const [metafyGuideDeckSearch, setMetafyGuideDeckSearch] = useState('');
  const [showMetafyGuideDeckDropdown, setShowMetafyGuideDeckDropdown] = useState(false);
  const [selectedMetafyGuideDeck, setSelectedMetafyGuideDeck] = useState(null);
`;

// Find where to insert (after singleVideoDeckSearch state lines)
content = content.replace(
  /(const \[showSingleVideoDeckDropdown, setShowSingleVideoDeckDropdown\] = useState\(false\);)/,
  `$1\n${metafyStates}`
);

// Step 2: Add the Metafy guide form section right after the Single Video section closing tag
// First, let me find where the Single Video section ends - look for the closing div and insert before Bulk Import Section

const metafyFormSection = `
              {/* Single Metafy Guide Section */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', border: '2px solid #9b59b6', borderRadius: '8px', backgroundColor: '#f4ecf7' }}>
                <h2 style={{ marginTop: 0 }}>Add Single Metafy Guide</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Manually add a single Metafy guide to a specific deck.
                </p>

                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Deck (Optional)</label>
                  <input
                    type="text"
                    placeholder="Search for deck or leave empty..."
                    value={metafyGuideDeckSearch}
                    onChange={(e) => {
                      setMetafyGuideDeckSearch(e.target.value);
                      setShowMetafyGuideDeckDropdown(true);
                    }}
                    onFocus={() => setShowMetafyGuideDeckDropdown(true)}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                  />
                  {showMetafyGuideDeckDropdown && metafyGuideDeckSearch && (
                    <div className="deck-search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
                      {decks
                        .filter(deck => deck.name.toLowerCase().includes(metafyGuideDeckSearch.toLowerCase()))
                        .slice(0, 10)
                        .map(deck => {
                          const icons = deck.icons ? JSON.parse(deck.icons) : [];
                          return (
                            <div
                              key={deck.id}
                              className="deck-search-item"
                              onClick={() => {
                                setSelectedMetafyGuideDeck(deck);
                                setMetafyGuideDeckSearch(deck.name);
                                setShowMetafyGuideDeckDropdown(false);
                                setMetafyGuide({ ...metafyGuide, deckId: deck.id });
                              }}
                            >
                              <div className="deck-icons-group">
                                {icons.length > 0 ? (
                                  icons.slice(0, 2).map((iconPath, idx) => (
                                    <img key={idx} src={iconPath} alt="" className="deck-search-icon" />
                                  ))
                                ) : (
                                  <div className="deck-search-icon-placeholder">?</div>
                                )}
                              </div>
                              <span>{deck.name}</span>
                            </div>
                          );
                        })}
                      {decks.filter(deck => deck.name.toLowerCase().includes(metafyGuideDeckSearch.toLowerCase())).length === 0 && (
                        <div className="deck-search-item" style={{ color: '#999' }}>No decks found</div>
                      )}
                    </div>
                  )}
                  {selectedMetafyGuideDeck && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      Selected: <strong>{selectedMetafyGuideDeck.name}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMetafyGuideDeck(null);
                          setMetafyGuideDeckSearch('');
                          setMetafyGuide({ ...metafyGuide, deckId: null });
                        }}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        className="btn btn-secondary"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Metafy Guide URL *</label>
                  <input
                    type="url"
                    placeholder="https://metafy.gg/..."
                    value={metafyGuide.url}
                    onChange={(e) => setMetafyGuide({ ...metafyGuide, url: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title *</label>
                  <input
                    type="text"
                    placeholder="Guide title..."
                    value={metafyGuide.title}
                    onChange={(e) => setMetafyGuide({ ...metafyGuide, title: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Author *</label>
                  <input
                    type="text"
                    placeholder="Author name..."
                    value={metafyGuide.author}
                    onChange={(e) => setMetafyGuide({ ...metafyGuide, author: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Publication Date</label>
                    <input
                      type="date"
                      value={metafyGuide.publicationDate}
                      onChange={(e) => setMetafyGuide({ ...metafyGuide, publicationDate: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price</label>
                    <input
                      type="text"
                      placeholder="e.g., $4.99"
                      value={metafyGuide.price}
                      onChange={(e) => setMetafyGuide({ ...metafyGuide, price: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!metafyGuide.title || !metafyGuide.url || !metafyGuide.author) {
                      alert('Please fill in all required fields (Title, URL, Author)');
                      return;
                    }

                    try {
                      // Create or find author profile
                      const slug = metafyGuide.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                      // Check if author exists
                      const authorsResponse = await fetch('/api/authors');
                      const authors = await authorsResponse.json();
                      let author = authors.find(a => a.slug === slug);
                      let authorId = null;

                      if (!author) {
                        // Create new author with Metafy link
                        const createAuthorResponse = await fetch('/api/authors', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: metafyGuide.author,
                            metafy: metafyGuide.url.includes('metafy.gg/@') ?
                              metafyGuide.url.substring(0, metafyGuide.url.indexOf('/guide')) || metafyGuide.url :
                              null
                          })
                        });
                        if (createAuthorResponse.ok) {
                          author = await createAuthorResponse.json();
                          authorId = author.id;
                        }
                      } else {
                        authorId = author.id;
                        // Update author with Metafy URL if not set
                        if (!author.metafy && metafyGuide.url.includes('metafy.gg/@')) {
                          await fetch('/api/authors', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: author.id,
                              metafy: metafyGuide.url.substring(0, metafyGuide.url.indexOf('/guide')) || metafyGuide.url
                            })
                          });
                        }
                      }

                      // Create the resource
                      const resourceData = {
                        title: metafyGuide.title,
                        url: metafyGuide.url,
                        author: metafyGuide.author,
                        authorId: authorId,
                        type: 'Guide',
                        platform: 'Metafy',
                        accessType: 'Paid',
                        status: 'approved',
                        deckId: metafyGuide.deckId,
                        publicationDate: metafyGuide.publicationDate || null
                      };

                      const response = await fetch('/api/resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(resourceData)
                      });

                      if (response.ok) {
                        alert('Metafy guide added successfully!');
                        // Reset form
                        setMetafyGuide({
                          title: '',
                          url: '',
                          author: '',
                          deckId: null,
                          publicationDate: '',
                          price: ''
                        });
                        setMetafyGuideDeckSearch('');
                        setSelectedMetafyGuideDeck(null);
                        // Refresh paid guides list
                        fetchPaidGuidesResources();
                      } else {
                        const error = await response.json();
                        alert(\`Error: \${error.error || 'Failed to add guide'}\`);
                      }
                    } catch (error) {
                      console.error('Error adding Metafy guide:', error);
                      alert('Failed to add Metafy guide');
                    }
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
                >
                  💎 Add Metafy Guide
                </button>
              </div>
`;

// Insert the Metafy form right after the Single Video section closes (before Bulk Import heading)
content = content.replace(
  /(<\/button>\s*<\/div>\s*\n\s*<h2>Bulk Import YouTube Videos<\/h2>)/,
  `</button>\n              </div>\n${metafyFormSection}\n              <h2>Bulk Import YouTube Videos</h2>`
);

fs.writeFileSync('src/App.js', content);
console.log('Successfully added Metafy guide form!');
