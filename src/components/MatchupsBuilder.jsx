import React, { useState, useEffect } from 'react';
import './MatchupsBuilder.css';

const MatchupsBuilder = ({ matchups = [], onChange }) => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localMatchups, setLocalMatchups] = useState(matchups);
  const [deckSearches, setDeckSearches] = useState({});
  const [showDropdowns, setShowDropdowns] = useState({});

  useEffect(() => {
    fetchDecks();
  }, []);

  useEffect(() => {
    setLocalMatchups(matchups);
  }, [matchups]);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMatchup = () => {
    const newMatchup = {
      opposingDeckId: '',
      winPercentage: 50,
      notes: '',
      keyCards: []
    };
    const updated = [...localMatchups, newMatchup];
    setLocalMatchups(updated);
    onChange(updated);
  };

  const removeMatchup = (index) => {
    const updated = localMatchups.filter((_, i) => i !== index);
    setLocalMatchups(updated);
    onChange(updated);

    // Clean up search state for this matchup
    const newSearches = { ...deckSearches };
    const newDropdowns = { ...showDropdowns };
    delete newSearches[index];
    delete newDropdowns[index];
    setDeckSearches(newSearches);
    setShowDropdowns(newDropdowns);
  };

  const updateMatchup = (index, field, value) => {
    const updated = [...localMatchups];
    updated[index] = { ...updated[index], [field]: value };
    setLocalMatchups(updated);
    onChange(updated);
  };

  const addKeyCard = (matchupIndex) => {
    const newCard = { name: '', importance: 'high' };
    const updated = [...localMatchups];
    updated[matchupIndex].keyCards = [...(updated[matchupIndex].keyCards || []), newCard];
    setLocalMatchups(updated);
    onChange(updated);
  };

  const removeKeyCard = (matchupIndex, cardIndex) => {
    const updated = [...localMatchups];
    updated[matchupIndex].keyCards = updated[matchupIndex].keyCards.filter((_, i) => i !== cardIndex);
    setLocalMatchups(updated);
    onChange(updated);
  };

  const updateKeyCard = (matchupIndex, cardIndex, field, value) => {
    const updated = [...localMatchups];
    updated[matchupIndex].keyCards[cardIndex] = {
      ...updated[matchupIndex].keyCards[cardIndex],
      [field]: value
    };
    setLocalMatchups(updated);
    onChange(updated);
  };

  const moveMatchup = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === localMatchups.length - 1)
    ) {
      return;
    }

    const updated = [...localMatchups];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setLocalMatchups(updated);
    onChange(updated);
  };

  const getSelectedDeck = (deckId) => {
    return decks.find(d => d.id === parseInt(deckId));
  };

  const handleDeckSearch = (index, value) => {
    setDeckSearches({ ...deckSearches, [index]: value });
    setShowDropdowns({ ...showDropdowns, [index]: true });
  };

  const selectDeck = (index, deck) => {
    updateMatchup(index, 'opposingDeckId', deck.id);
    setDeckSearches({ ...deckSearches, [index]: deck.name });
    setShowDropdowns({ ...showDropdowns, [index]: false });
  };

  const getFilteredDecks = (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return decks;
    }
    return decks.filter(deck =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return <div className="matchups-loading">Loading decks...</div>;
  }

  return (
    <div className="matchups-builder">
      <div className="matchups-header">
        <h3>Matchups</h3>
        <button type="button" onClick={addMatchup} className="add-matchup-btn">
          + Add Matchup
        </button>
      </div>

      {localMatchups.length === 0 ? (
        <div className="no-matchups">
          <p>No matchups added yet. Click "Add Matchup" to get started.</p>
        </div>
      ) : (
        <div className="matchups-list">
          {localMatchups.map((matchup, index) => {
            const selectedDeck = getSelectedDeck(matchup.opposingDeckId);
            const searchQuery = deckSearches[index] || (selectedDeck ? selectedDeck.name : '');
            const filteredDecks = getFilteredDecks(searchQuery);

            return (
              <div key={index} className="matchup-card">
                <div className="matchup-header">
                  <div className="matchup-order">
                    <button
                      type="button"
                      onClick={() => moveMatchup(index, 'up')}
                      disabled={index === 0}
                      className="move-btn"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <span className="matchup-number">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => moveMatchup(index, 'down')}
                      disabled={index === localMatchups.length - 1}
                      className="move-btn"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMatchup(index)}
                    className="remove-matchup-btn"
                    title="Remove matchup"
                  >
                    ✕
                  </button>
                </div>

                <div className="matchup-body">
                  {/* Opposing Deck Selection with Search */}
                  <div className="form-group">
                    <label>Opposing Deck</label>
                    <div className="deck-search-container" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleDeckSearch(index, e.target.value)}
                        onFocus={() => setShowDropdowns({ ...showDropdowns, [index]: true })}
                        placeholder="Search for a deck..."
                        className="deck-search-input"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />

                      {showDropdowns[index] && filteredDecks.length > 0 && (
                        <div
                          className="deck-dropdown"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginTop: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {filteredDecks.map(deck => (
                            <div
                              key={deck.id}
                              onClick={() => selectDeck(index, deck)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              {deck.icons && deck.icons.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {deck.icons.map((icon, i) => (
                                    <img
                                      key={i}
                                      src={icon}
                                      alt=""
                                      style={{ width: '20px', height: '20px' }}
                                    />
                                  ))}
                                </div>
                              )}
                              <span>{deck.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedDeck && selectedDeck.icons && (
                      <div className="deck-icons" style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                        {selectedDeck.icons.map((icon, i) => (
                          <img
                            key={i}
                            src={icon}
                            alt=""
                            className="deck-icon"
                            style={{ width: '24px', height: '24px' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Win Percentage */}
                  <div className="matchup-stats">
                    <div className="form-group">
                      <label>Win Rate: {matchup.winPercentage}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={matchup.winPercentage}
                        onChange={(e) => updateMatchup(index, 'winPercentage', parseInt(e.target.value))}
                        className="win-rate-slider"
                      />
                    </div>
                  </div>

                  {/* Matchup Notes */}
                  <div className="form-group">
                    <label>Matchup Strategy</label>
                    <textarea
                      value={matchup.notes}
                      onChange={(e) => updateMatchup(index, 'notes', e.target.value)}
                      placeholder="Describe the strategy for this matchup..."
                      rows="3"
                      className="matchup-notes"
                    />
                  </div>

                  {/* Key Cards */}
                  <div className="key-cards-section">
                    <div className="key-cards-header">
                      <label>Key Cards</label>
                      <button
                        type="button"
                        onClick={() => addKeyCard(index)}
                        className="add-card-btn"
                      >
                        + Add Card
                      </button>
                    </div>

                    {matchup.keyCards && matchup.keyCards.length > 0 && (
                      <div className="key-cards-list">
                        {matchup.keyCards.map((card, cardIndex) => (
                          <div key={cardIndex} className="key-card-row">
                            <input
                              type="text"
                              value={card.name}
                              onChange={(e) => updateKeyCard(index, cardIndex, 'name', e.target.value)}
                              placeholder="Card name"
                              className="card-name-input"
                            />
                            <select
                              value={card.importance}
                              onChange={(e) => updateKeyCard(index, cardIndex, 'importance', e.target.value)}
                              className="card-importance-select"
                            >
                              <option value="high">High Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="low">Low Priority</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeKeyCard(index, cardIndex)}
                              className="remove-card-btn"
                              title="Remove card"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchupsBuilder;
