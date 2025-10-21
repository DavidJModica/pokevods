import React, { useState, useEffect } from 'react';
import './HostedGuidesAdmin.css';

const HostedGuidesAdmin = ({ decks }) => {
  const [hostedGuides, setHostedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'

  useEffect(() => {
    fetchHostedGuides();
  }, []);

  const fetchHostedGuides = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const response = await fetch('/api/hosted-guides?all=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hosted guides');
      }

      const data = await response.json();
      setHostedGuides(data);
    } catch (error) {
      console.error('Failed to fetch hosted guides:', error);
      alert('Failed to load hosted guides');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (guideId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const response = await fetch('/api/hosted-guides', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: guideId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete guide');
      }

      alert('Guide deleted successfully');
      fetchHostedGuides();
    } catch (error) {
      console.error('Failed to delete guide:', error);
      alert('Failed to delete guide: ' + error.message);
    }
  };

  const handleTogglePublish = async (guide) => {
    const newStatus = guide.publishStatus === 'published' ? 'draft' : 'published';
    const confirmMessage = newStatus === 'published'
      ? `Publish "${guide.title}"? It will be visible to all users.`
      : `Unpublish "${guide.title}"? It will be hidden from public view.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const response = await fetch('/api/hosted-guides', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: guide.id,
          publishStatus: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update guide status');
      }

      alert(`Guide ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      fetchHostedGuides();
    } catch (error) {
      console.error('Failed to update guide status:', error);
      alert('Failed to update guide status: ' + error.message);
    }
  };

  const handleToggleAuthorPermission = async (author) => {
    const newStatus = !author.canCreateGuides;
    const confirmMessage = newStatus
      ? `Grant guide creation permission to ${author.name}?`
      : `Revoke guide creation permission from ${author.name}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const response = await fetch('/api/authors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: author.id,
          canCreateGuides: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update author permissions');
      }

      alert(`Author permissions updated successfully`);
      fetchHostedGuides();
    } catch (error) {
      console.error('Failed to update author permissions:', error);
      alert('Failed to update author permissions: ' + error.message);
    }
  };

  const createNewGuide = () => {
    window.open('/guides/create', '_blank');
  };

  const editGuide = (guideId) => {
    window.open(`/guides/edit/${guideId}`, '_blank');
  };

  const viewGuide = (slug) => {
    window.open(`/guides/${slug}`, '_blank');
  };

  const filteredGuides = hostedGuides.filter(guide => {
    if (filter === 'all') return true;
    return guide.publishStatus === filter;
  });

  const getDeck = (deckId) => {
    return decks.find(d => d.id === deckId);
  };

  // Get unique authors from guides
  const authors = [...new Map(
    hostedGuides
      .filter(g => g.authorProfile)
      .map(g => g.authorProfile)
      .map(a => [a.id, a])
  ).values()];

  if (loading) {
    return (
      <div className="hosted-guides-admin">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading hosted guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hosted-guides-admin">
      <div className="admin-header">
        <div>
          <h2>Manage Hosted Guides ({filteredGuides.length})</h2>
          <p className="subtitle">
            Guides written directly on PokeVods with the rich text editor
          </p>
        </div>
        <button onClick={createNewGuide} className="btn-create">
          + Create New Hosted Guide
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({hostedGuides.length})
        </button>
        <button
          className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
          onClick={() => setFilter('published')}
        >
          Published ({hostedGuides.filter(g => g.publishStatus === 'published').length})
        </button>
        <button
          className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Drafts ({hostedGuides.filter(g => g.publishStatus === 'draft').length})
        </button>
      </div>

      {/* Guides List */}
      {filteredGuides.length === 0 ? (
        <div className="empty-state">
          <p>No {filter === 'all' ? 'hosted' : filter} guides found.</p>
          <button onClick={createNewGuide} className="btn-create-secondary">
            Create Your First Hosted Guide
          </button>
        </div>
      ) : (
        <div className="guides-list">
          {filteredGuides.map(guide => {
            const deck = getDeck(guide.deckId);
            const deckIcons = deck?.icons ? JSON.parse(deck.icons) : [];

            return (
              <div key={guide.id} className="guide-item">
                <div className="guide-item-header">
                  <div className="guide-title-section">
                    {deckIcons.length > 0 && (
                      <div className="deck-icons">
                        {deckIcons.map((icon, i) => (
                          <img key={i} src={icon} alt="" className="deck-icon" />
                        ))}
                      </div>
                    )}
                    <div>
                      <h3>{guide.title}</h3>
                      <div className="guide-meta">
                        <span className={`status-badge ${guide.publishStatus}`}>
                          {guide.publishStatus === 'published' ? '✓ Published' : '✎ Draft'}
                        </span>
                        {deck && <span className="deck-name">{deck.name}</span>}
                        {guide.authorProfile && (
                          <span className="author-name">by {guide.authorProfile.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="guide-actions">
                    {guide.publishStatus === 'published' && (
                      <button
                        onClick={() => viewGuide(guide.slug)}
                        className="btn-action view"
                        title="View published guide"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => editGuide(guide.id)}
                      className="btn-action edit"
                      title="Edit guide"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(guide)}
                      className={`btn-action ${guide.publishStatus === 'published' ? 'unpublish' : 'publish'}`}
                      title={guide.publishStatus === 'published' ? 'Unpublish guide' : 'Publish guide'}
                    >
                      {guide.publishStatus === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id, guide.title)}
                      className="btn-action delete"
                      title="Delete guide"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="guide-item-details">
                  <div className="detail-row">
                    <span className="detail-label">Sections:</span>
                    <span>{guide.guideSections?.length || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Views:</span>
                    <span>{guide.views || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                  </div>
                  {guide.publicationDate && (
                    <div className="detail-row">
                      <span className="detail-label">Published:</span>
                      <span>{new Date(guide.publicationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Author Permissions Section */}
      {authors.length > 0 && (
        <div className="authors-section">
          <h3>Author Permissions</h3>
          <p className="subtitle">
            Manage which authors can create hosted guides
          </p>

          <div className="authors-list">
            {authors.map(author => (
              <div key={author.id} className="author-item">
                <div className="author-info">
                  {author.profilePicture && (
                    <img
                      src={author.profilePicture}
                      alt={author.name}
                      className="author-avatar"
                    />
                  )}
                  <div>
                    <strong>{author.name}</strong>
                    <div className="author-email">{author.email}</div>
                  </div>
                </div>

                <div className="author-permission">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={author.canCreateGuides}
                      onChange={() => handleToggleAuthorPermission(author)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-text">
                      Can Create Guides
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostedGuidesAdmin;
