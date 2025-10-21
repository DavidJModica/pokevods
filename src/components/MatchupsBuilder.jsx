import React, { useState, useEffect } from 'react';
import './MatchupsBuilder.css';

const MatchupsBuilder = ({ matchups = [], onChange }) => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localMatchups, setLocalMatchups] = useState(matchups);

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
                  {/* Opposing Deck Selection */}
                  <div className="form-group">
                    <label>Opposing Deck</label>
                    <select
                      value={matchup.opposingDeckId}
                      onChange={(e) => updateMatchup(index, 'opposingDeckId', e.target.value)}
                      className="deck-select"
                      required
                    >
                      <option value="">Select a deck...</option>
                      {decks.map(deck => (
                        <option key={deck.id} value={deck.id}>
                          {deck.name}
                        </option>
                      ))}
                    </select>
                    {selectedDeck && selectedDeck.icons && (
                      <div className="deck-icons">
                        {selectedDeck.icons.map((icon, i) => (
                          <img
                            key={i}
                            src={icon}
                            alt=""
                            className="deck-icon"
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
