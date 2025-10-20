const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/App.js', 'utf8');

// Step 1: Add state variables for authors after line 76 (after paidGuides state)
const stateAddition = `  const [authors, setAuthors] = useState([]);
  const [editingAuthor, setEditingAuthor] = useState({}); // { [authorId]: { name, youtube, metafy } }
`;

content = content.replace(
  /(const \[paidGuides, setPaidGuides\] = useState\(\[\]\);)/,
  `$1\n${stateAddition}`
);

// Step 2: Update adminTab comment to include 'manageAuthors'
content = content.replace(
  /const \[adminTab, setAdminTab\] = useState\('bulkImport'\); \/\/ 'bulkImport', 'reviewQueue', 'matchupQueue', 'manageGuides'/,
  "const [adminTab, setAdminTab] = useState('bulkImport'); // 'bulkImport', 'reviewQueue', 'matchupQueue', 'manageGuides', 'manageAuthors'"
);

// Step 3: Add fetchAuthors function after fetchPaidGuidesResources
const fetchAuthorsFunc = `
  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };
`;

// Find where to insert fetchAuthors - after fetchPaidGuidesResources
content = content.replace(
  /(const fetchPaidGuidesResources[\s\S]*?};)/,
  `$1${fetchAuthorsFunc}`
);

// Step 4: Add Manage Authors tab button after Manage Guides button
const authorTabButton = `            <button
              onClick={() => {
                setAdminTab('manageAuthors');
                fetchAuthors();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'manageAuthors' ? '#007bff' : 'transparent',
                color: adminTab === 'manageAuthors' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'manageAuthors' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              👤 Manage Authors {authors.length > 0 && \`(\${authors.length})\`}
            </button>
`;

content = content.replace(
  /(💎 Manage Guides.*?\n\s*<\/button>)/,
  `$1\n${authorTabButton}`
);

// Step 5: Add Manage Authors tab content before the edit resource modal
const authorTabContent = `
          {/* Manage Authors Tab */}
          {adminTab === 'manageAuthors' && (
            <div>
              <h2>Manage Authors ({authors.length})</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Edit author profiles including name, YouTube link, and Metafy link.
              </p>

              {authors.length === 0 ? (
                <p>No authors found.</p>
              ) : (
                authors.map((author) => {
                  const editData = editingAuthor[author.id] || {
                    name: author.name,
                    youtube: author.youtube || '',
                    metafy: author.metafy || ''
                  };

                  return (
                    <div key={author.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1.1rem' }}>{author.name}</strong>
                          <span style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}>{author._count?.resources || 0} resources</span>
                        </div>

                        {/* Name Input */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Author Name:
                          </label>
                          <input
                            type="text"
                            placeholder="Author name..."
                            value={editData.name}
                            onChange={(e) => {
                              setEditingAuthor({
                                ...editingAuthor,
                                [author.id]: { ...editData, name: e.target.value }
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              fontSize: '1rem',
                              borderRadius: '6px',
                              border: '2px solid #ddd'
                            }}
                          />
                        </div>

                        {/* YouTube Link Input */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            YouTube Channel URL:
                          </label>
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/@channel..."
                            value={editData.youtube}
                            onChange={(e) => {
                              setEditingAuthor({
                                ...editingAuthor,
                                [author.id]: { ...editData, youtube: e.target.value }
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              fontSize: '1rem',
                              borderRadius: '6px',
                              border: '2px solid #ddd'
                            }}
                          />
                        </div>

                        {/* Metafy Link Input */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Metafy Profile URL:
                          </label>
                          <input
                            type="text"
                            placeholder="https://metafy.gg/@username..."
                            value={editData.metafy}
                            onChange={(e) => {
                              setEditingAuthor({
                                ...editingAuthor,
                                [author.id]: { ...editData, metafy: e.target.value }
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              fontSize: '1rem',
                              borderRadius: '6px',
                              border: '2px solid #ddd'
                            }}
                          />
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/authors', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: author.id,
                                    name: editData.name,
                                    youtube: editData.youtube || null,
                                    metafy: editData.metafy || null
                                  })
                                });

                                if (response.ok) {
                                  await fetchAuthors(); // Refresh the list
                                  alert(\`Successfully updated "\${editData.name}"\`);
                                } else {
                                  alert('Failed to update author');
                                }
                              } catch (error) {
                                console.error('Error updating author:', error);
                                alert('Failed to update author');
                              }
                            }}
                          >
                            💾 Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                            onClick={() => {
                              setEditingAuthor({
                                ...editingAuthor,
                                [author.id]: {
                                  name: author.name,
                                  youtube: author.youtube || '',
                                  metafy: author.metafy || ''
                                }
                              });
                            }}
                          >
                            ↺ Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
`;

content = content.replace(
  /(}\s*)\n(\s*{\/\* Edit Resource Modal)/,
  `$1\n${authorTabContent}\n$2`
);

// Write the modified content back
fs.writeFileSync('src/App.js', content);
console.log('Successfully added Manage Authors tab!');
