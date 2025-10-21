import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './GuideViewer.css';

const GuideViewer = () => {
  const { slug } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetchGuide();
  }, [slug]);

  const fetchGuide = async () => {
    try {
      const response = await fetch(`/api/hosted-guides?slug=${slug}`);

      if (!response.ok) {
        throw new Error('Guide not found');
      }

      const data = await response.json();
      setGuide(data);

      // Track view
      await fetch('/api/guide-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
      });

    } catch (error) {
      console.error('Failed to fetch guide:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (index) => {
    setActiveSection(index);
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Favored': return '#22c55e';
      case 'Even': return '#eab308';
      case 'Unfavored': return '#f97316';
      case 'Very Unfavored': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getImportanceBadge = (importance) => {
    const styles = {
      high: { bg: '#fee2e2', color: '#dc2626', label: 'High Priority' },
      medium: { bg: '#fef3c7', color: '#d97706', label: 'Medium Priority' },
      low: { bg: '#dbeafe', color: '#2563eb', label: 'Low Priority' }
    };

    const style = styles[importance] || styles.medium;

    return (
      <span
        className="importance-badge"
        style={{
          backgroundColor: style.bg,
          color: style.color
        }}
      >
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="guide-viewer-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading guide...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guide-viewer-container">
        <div className="error-state">
          <h2>Guide Not Found</h2>
          <p>{error}</p>
          <Link to="/guides" className="back-link">
            ← Back to Guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-viewer-container">
      {/* Guide Header */}
      <header className="guide-header">
        <div className="guide-header-content">
          <Link to="/guides" className="back-link">
            ← Back to Guides
          </Link>

          <h1 className="guide-title">{guide.title}</h1>

          <div className="guide-meta">
            {guide.deck && (
              <div className="guide-deck">
                {guide.deck.icons && (
                  <div className="deck-icons">
                    {guide.deck.icons.map((icon, i) => (
                      <img key={i} src={icon} alt="" className="deck-icon" />
                    ))}
                  </div>
                )}
                <span className="deck-name">{guide.deck.name}</span>
              </div>
            )}

            {guide.authorProfile && (
              <div className="guide-author">
                {guide.authorProfile.profilePicture && (
                  <img
                    src={guide.authorProfile.profilePicture}
                    alt={guide.authorProfile.name}
                    className="author-avatar"
                  />
                )}
                <div className="author-info">
                  <span className="author-label">Written by</span>
                  <Link
                    to={`/author/${guide.authorProfile.slug}`}
                    className="author-name"
                  >
                    {guide.authorProfile.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="guide-stats">
              <span className="stat">
                <span className="stat-icon">👁️</span>
                {guide.views || 0} views
              </span>
              <span className="stat">
                <span className="stat-icon">📅</span>
                {new Date(guide.publicationDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {guide.thumbnail && (
          <div className="guide-thumbnail">
            <img src={guide.thumbnail} alt={guide.title} />
          </div>
        )}
      </header>

      <div className="guide-body">
        {/* Table of Contents */}
        <aside className="guide-toc">
          <h3>Table of Contents</h3>
          <nav>
            {guide.guideSections.map((section, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`toc-item ${activeSection === index ? 'active' : ''}`}
              >
                {section.title}
                {section.sectionType === 'matchups' && (
                  <span className="toc-badge">
                    {section.matchups?.length || 0}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Guide Content */}
        <main className="guide-content">
          {guide.guideSections.map((section, index) => (
            <section
              key={index}
              id={`section-${index}`}
              className="guide-section"
            >
              <h2 className="section-title">{section.title}</h2>

              {section.sectionType === 'matchups' ? (
                <div className="matchups-display">
                  {section.matchups && section.matchups.length > 0 ? (
                    <div className="matchups-grid">
                      {section.matchups.map((matchup, mIndex) => (
                        <div key={mIndex} className="matchup-card">
                          {/* Matchup Header */}
                          <div className="matchup-card-header">
                            {matchup.opposingDeck && (
                              <>
                                {matchup.opposingDeck.icons && (
                                  <div className="matchup-deck-icons">
                                    {matchup.opposingDeck.icons.map((icon, i) => (
                                      <img
                                        key={i}
                                        src={icon}
                                        alt=""
                                        className="matchup-deck-icon"
                                      />
                                    ))}
                                  </div>
                                )}
                                <h3 className="matchup-deck-name">
                                  {matchup.opposingDeck.name}
                                </h3>
                              </>
                            )}
                          </div>

                          {/* Matchup Stats */}
                          <div className="matchup-stats">
                            <div className="matchup-stat">
                              <span className="stat-label">Win Rate</span>
                              <div className="win-rate-bar">
                                <div
                                  className="win-rate-fill"
                                  style={{
                                    width: `${matchup.winPercentage}%`,
                                    backgroundColor:
                                      matchup.winPercentage >= 60
                                        ? '#22c55e'
                                        : matchup.winPercentage >= 40
                                        ? '#eab308'
                                        : '#ef4444'
                                  }}
                                ></div>
                              </div>
                              <span className="win-rate-value">
                                {matchup.winPercentage}%
                              </span>
                            </div>

                            <div className="matchup-stat">
                              <span className="stat-label">Difficulty</span>
                              <span
                                className="difficulty-badge"
                                style={{
                                  backgroundColor: getDifficultyColor(matchup.difficulty),
                                  color: 'white'
                                }}
                              >
                                {matchup.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* Matchup Notes */}
                          {matchup.notes && (
                            <div className="matchup-notes">
                              <h4>Strategy</h4>
                              <p>{matchup.notes}</p>
                            </div>
                          )}

                          {/* Key Cards */}
                          {matchup.keyCards && matchup.keyCards.length > 0 && (
                            <div className="matchup-key-cards">
                              <h4>Key Cards</h4>
                              <div className="key-cards-list">
                                {matchup.keyCards.map((card, cIndex) => (
                                  <div key={cIndex} className="key-card-item">
                                    <span className="card-name">{card.name}</span>
                                    {getImportanceBadge(card.importance)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-matchups">No matchups added yet.</p>
                  )}
                </div>
              ) : (
                <div
                  className="section-content"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
            </section>
          ))}

          {/* Author Bio */}
          {guide.authorProfile && (
            <section className="author-section">
              <h2>About the Author</h2>
              <div className="author-card">
                {guide.authorProfile.profilePicture && (
                  <img
                    src={guide.authorProfile.profilePicture}
                    alt={guide.authorProfile.name}
                    className="author-card-avatar"
                  />
                )}
                <div className="author-card-content">
                  <h3>{guide.authorProfile.name}</h3>
                  {guide.authorProfile.bio && (
                    <p className="author-bio">{guide.authorProfile.bio}</p>
                  )}
                  <div className="author-socials">
                    {guide.authorProfile.youtube && (
                      <a
                        href={guide.authorProfile.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link youtube"
                      >
                        YouTube
                      </a>
                    )}
                    {guide.authorProfile.twitter && (
                      <a
                        href={guide.authorProfile.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link twitter"
                      >
                        Twitter
                      </a>
                    )}
                    {guide.authorProfile.twitch && (
                      <a
                        href={guide.authorProfile.twitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link twitch"
                      >
                        Twitch
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default GuideViewer;
