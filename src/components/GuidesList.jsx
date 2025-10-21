import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './GuidesList.css';

const GuidesList = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    fetchGuides();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthor(true);
    }
  };

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/hosted-guides');
      if (!response.ok) {
        throw new Error('Failed to fetch guides');
      }
      const data = await response.json();
      setGuides(data);
    } catch (error) {
      console.error('Failed to fetch guides:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="guides-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guides-list-container">
        <div className="error-state">
          <h2>Error Loading Guides</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guides-list-container">
      <header className="guides-list-header">
        <div>
          <h1>Deck Guides</h1>
          <p className="subtitle">In-depth guides written by expert players</p>
        </div>
        {isAuthor && (
          <Link to="/create" className="create-guide-btn">
            + Create New Guide
          </Link>
        )}
      </header>

      {guides.length === 0 ? (
        <div className="no-guides">
          <h3>No Guides Available</h3>
          <p>Check back soon for new guides from our expert players!</p>
        </div>
      ) : (
        <div className="guides-grid">
          {guides.map(guide => (
            <div
              key={guide.id}
              className="guide-card"
              onClick={() => navigate(`/${guide.slug}`)}
            >
              {guide.thumbnail && (
                <div className="guide-card-thumbnail">
                  <img src={guide.thumbnail} alt={guide.title} />
                </div>
              )}

              <div className="guide-card-content">
                {guide.deck && guide.deck.icons && (
                  <div className="guide-card-icons">
                    {guide.deck.icons.map((icon, i) => (
                      <img key={i} src={icon} alt="" className="deck-icon" />
                    ))}
                  </div>
                )}

                <h3 className="guide-card-title">{guide.title}</h3>

                {guide.deck && (
                  <p className="guide-card-deck">{guide.deck.name}</p>
                )}

                {guide.authorProfile && (
                  <div className="guide-card-author">
                    {guide.authorProfile.profilePicture && (
                      <img
                        src={guide.authorProfile.profilePicture}
                        alt={guide.authorProfile.name}
                        className="author-avatar"
                      />
                    )}
                    <span className="author-name">
                      {guide.authorProfile.name}
                    </span>
                  </div>
                )}

                <div className="guide-card-meta">
                  <span className="meta-item">
                    👁️ {guide.views || 0} views
                  </span>
                  <span className="meta-item">
                    {new Date(guide.publicationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuidesList;
