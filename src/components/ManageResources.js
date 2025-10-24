import React, { useState, useEffect } from 'react';

export default function ManageResources({
  isActive,
  allResources,
  setAllResources,
  fetchAllResources,
  setEditingResource,
  setEditDeckSearch,
  setShowEditDeckDropdown,
  decks
}) {
  // Auto-load resources when component becomes active
  useEffect(() => {
    if (isActive && allResources.length === 0) {
      fetchAllResources();
    }
  }, [isActive, allResources.length, fetchAllResources]);

  if (!isActive) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Manage All Resources ({allResources.length})</h2>
        <button
          onClick={() => {
            setAllResources([]);
            fetchAllResources();
          }}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem' }}
        >
          🔄 Refresh
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        View and edit all resources sorted by newest first. Click refresh if resources don't load automatically.
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
                <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
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
                      if (window.confirm(`Are you sure you want to delete "${resource.title}"? This action cannot be undone.`)) {
                        try {
                          const response = await fetch(`/api/resources/${resource.id}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
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
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                <strong>URL:</strong>{' '}
                <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                  {resource.url}
                </a>
              </div>
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
  );
}
