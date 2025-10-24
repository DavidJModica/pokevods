const fs = require('fs');

console.log('Replacing Manage Resources with Matchup Queue pattern...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Find and replace the ManageResources component with inline code based on Matchup Queue
const componentPattern = /\{\/\* Manage Resources Tab \*\/\}[\s\S]*?<ManageResources[\s\S]*?\/>/;

const replacement = `{/* Manage Resources Tab */}
      {adminTab === 'manageResources' && (
        <div>
          <h2>Manage All Resources ({allResources.length})</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            View and edit all resources sorted by newest first.
          </p>

          {allResources.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No resources found!</p>
          ) : (
            allResources.map((resource, index) => (
              <div key={resource.id} style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {resource.deck?.name && <span style={{ color: '#28a745' }}>{resource.deck.name}</span>}
                    {' '}- {resource.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    <strong>Type:</strong> {resource.type} | <strong>Author:</strong> {resource.authorProfile?.name || resource.author || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    <strong>Created:</strong> {new Date(resource.createdAt).toLocaleString()}
                    {resource.publicationDate && (
                      <> | <strong>Published:</strong> {new Date(resource.publicationDate).toLocaleDateString()}</>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    <strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
                  </div>
                  {resource.chapters && resource.chapters.length > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                      <strong>Chapters:</strong> {resource.chapters.length}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingResource(resource);
                      setEditDeckSearch(resource.deck?.name || '');
                      setShowEditDeckDropdown(false);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      if (window.confirm(\`Are you sure you want to delete "\${resource.title}"?\`)) {
                        try {
                          const response = await fetch(\`/api/resources/\${resource.id}\`, { method: 'DELETE' });
                          if (response.ok) {
                            setAllResources(allResources.filter(r => r.id !== resource.id));
                            alert('Resource deleted successfully');
                          } else {
                            alert('Error deleting resource');
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          alert('Error deleting resource');
                        }
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}`;

if (componentPattern.test(content)) {
  content = content.replace(componentPattern, replacement);
  console.log('✅ Replaced ManageResources component with inline Matchup Queue pattern');
  fs.writeFileSync('src/App.js', content, 'utf8');
  console.log('\\n✅ Done! Now using the EXACT working pattern from Matchup Queue.');
} else {
  console.log('⚠️  Could not find ManageResources component pattern');
}
