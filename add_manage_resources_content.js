const fs = require('fs');

// Read App.js
let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Adding Manage Resources button and tab content...\n');

// 1. Add the button between Manage Authors and Hosted Guides
const pattern = `            </button>
            <button
              onClick={() => setAdminTab('hostedGuides')}`;

const replacement = `            </button>
            <button
              onClick={() => {
                setAdminTab('manageResources');
                fetchAllResources();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'manageResources' ? '#007bff' : 'transparent',
                color: adminTab === 'manageResources' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'manageResources' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              📚 Manage Resources {allResources.length > 0 && \`(\${allResources.length})\`}
            </button>
            <button
              onClick={() => setAdminTab('hostedGuides')}`;

content = content.replace(pattern, replacement);
console.log('✅ Added Manage Resources tab button');

// 2. Add the tab content after Manage Authors tab
// Find where Manage Authors tab content ends
const manageAuthorsEndPattern = `          {/* Manage Authors Tab */}
          {adminTab === 'manageAuthors' &&`;

// We need to find where this tab ends and add our new tab before the next tab
// Let's find a unique ending pattern for Manage Authors
const insertionPoint = `        </div>
      )}

      {/* Author View */}`;

const manageResourcesTab = `        </div>
      )}

      {/* Manage Resources Tab */}
      {adminTab === 'manageResources' && (
        <div>
          <h2>Manage All Resources ({allResources.length})</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            View and edit all resources sorted by newest first.
          </p>

          {allResources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              <p>No resources found. Click the button below to load resources.</p>
              <button
                onClick={fetchAllResources}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Load All Resources
              </button>
            </div>
          ) : (
            <div>
              {allResources.map((resource, index) => (
                <div
                  key={resource.id}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                        {resource.title}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        <span><strong>Type:</strong> {resource.type}</span>
                        {' • '}
                        <span><strong>Deck:</strong> {resource.deck?.name || 'None'}</span>
                        {' • '}
                        <span><strong>Author:</strong> {resource.authorProfile?.name || resource.author || 'Unknown'}</span>
                        {' • '}
                        <span><strong>Platform:</strong> {resource.platform || 'Unknown'}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' }}>
                        <span><strong>Created:</strong> {new Date(resource.createdAt).toLocaleString()}</span>
                        {resource.publicationDate && (
                          <>
                            {' • '}
                            <span><strong>Published:</strong> {new Date(resource.publicationDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ marginLeft: '1rem' }}>
                      <button
                        onClick={() => {
                          setEditingResource(resource);
                          setEditDeckSearch(resource.deck?.name || '');
                          setShowEditDeckDropdown(false);
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                  {resource.url && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <strong>URL:</strong>{' '}
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                        {resource.url.substring(0, 80)}{resource.url.length > 80 ? '...' : ''}
                      </a>
                    </div>
                  )}
                  {resource.chapters && resource.chapters.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                      <strong>Chapters:</strong> {resource.chapters.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Author View */}`;

content = content.replace(insertionPoint, manageResourcesTab);
console.log('✅ Added Manage Resources tab content');

// Write the updated file
fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ All changes completed!');
console.log('\nThe "Manage Resources" tab has been added to the admin section.');
console.log('It shows all resources sorted by newest first with:');
console.log('- Resource title, type, deck, author, platform');
console.log('- Creation and publication dates');
console.log('- Edit button for each resource');
console.log('- URL and chapter count');
