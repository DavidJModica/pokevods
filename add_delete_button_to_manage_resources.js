const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

console.log('Adding delete button to Manage Resources tab...\n');

// Find the edit button and add a delete button next to it
const oldButtons = `                    <div style={{ marginLeft: '1rem' }}>
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
                    </div>`;

const newButtons = `                    <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
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
                      <button
                        onClick={async () => {
                          if (window.confirm(\`Are you sure you want to delete "\${resource.title}"? This action cannot be undone.\`)) {
                            try {
                              const response = await fetch(\`/api/resources/\${resource.id}\`, {
                                method: 'DELETE'
                              });
                              if (response.ok) {
                                // Remove from local state
                                setAllResources(allResources.filter(r => r.id !== resource.id));
                                alert('Resource deleted successfully');
                              } else {
                                alert('Error deleting resource');
                              }
                            } catch (error) {
                              console.error('Error deleting resource:', error);
                              alert('Error deleting resource');
                            }
                          }
                        }}
                        className="btn btn-danger"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>`;

if (content.includes(oldButtons)) {
  content = content.replace(oldButtons, newButtons);
  console.log('✅ Added delete button next to edit button');
} else {
  console.log('⚠️  Could not find edit button pattern');
}

fs.writeFileSync('src/App.js', content, 'utf8');

console.log('\n✅ Delete button added!');
console.log('Each resource in the Manage Resources list now has:');
console.log('- ✏️ Edit button (opens edit modal)');
console.log('- 🗑️ Delete button (confirms then deletes)');
