import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import MatchupsBuilder from './MatchupsBuilder';
import './GuideEditor.css';

const SECTION_TYPES = [
  { value: 'intro', label: 'Introduction' },
  { value: 'decklist', label: 'Decklist' },
  { value: 'card_explanations', label: 'Card Explanations' },
  { value: 'possible_inclusions', label: 'Possible Inclusions' },
  { value: 'notable_exclusions', label: 'Notable Exclusions' },
  { value: 'matchups', label: 'Matchups' },
  { value: 'custom', label: 'Custom Section' }
];

const GuideEditorStandalone = ({ guideId, decks, onCancel, onSaveSuccess }) => {
  const [loading, setLoading] = useState(guideId ? true : false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [guideData, setGuideData] = useState({
    title: '',
    deckId: '',
    thumbnail: '',
    sections: [
      {
        type: 'intro',
        title: 'Introduction',
        content: '',
        order: 1,
        matchups: []
      },
      {
        type: 'decklist',
        title: 'Decklist',
        content: '',
        order: 2,
        matchups: []
      },
      {
        type: 'card_explanations',
        title: 'Card Explanations',
        content: '',
        order: 3,
        matchups: []
      },
      {
        type: 'notable_exclusions',
        title: 'Notable Exclusions',
        content: '',
        order: 4,
        matchups: []
      },
      {
        type: 'matchups',
        title: 'Matchups',
        content: '',
        order: 5,
        matchups: []
      }
    ]
  });

  useEffect(() => {
    if (guideId) {
      fetchGuide();
    }
  }, [guideId]);

  const fetchGuide = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/hosted-guides?id=${guideId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guide');
      }

      const guide = await response.json();

      // Transform guide sections to match our structure
      const transformedSections = guide.guideSections.map(section => ({
        type: section.sectionType,
        title: section.title,
        content: section.content,
        order: section.order,
        matchups: section.matchups || []
      }));

      setGuideData({
        title: guide.title,
        deckId: guide.deckId,
        thumbnail: guide.thumbnail || '',
        sections: transformedSections
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch guide:', error);
      alert('Failed to load guide');
      if (onCancel) onCancel();
    }
  };

  const addSection = () => {
    const newSection = {
      type: 'custom',
      title: 'New Section',
      content: '',
      order: guideData.sections.length + 1,
      matchups: []
    };

    setGuideData({
      ...guideData,
      sections: [...guideData.sections, newSection]
    });

    // Switch to the new section
    setActiveTab(guideData.sections.length);
  };

  const removeSection = (index) => {
    if (guideData.sections.length === 1) {
      alert('You must have at least one section');
      return;
    }

    const updated = guideData.sections.filter((_, i) => i !== index);
    // Reorder sections
    updated.forEach((section, i) => {
      section.order = i + 1;
    });

    setGuideData({
      ...guideData,
      sections: updated
    });

    // Adjust active tab if necessary
    if (activeTab >= updated.length) {
      setActiveTab(updated.length - 1);
    }
  };

  const updateSection = (index, field, value) => {
    const updated = [...guideData.sections];
    updated[index] = { ...updated[index], [field]: value };
    setGuideData({
      ...guideData,
      sections: updated
    });
  };

  const moveSection = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === guideData.sections.length - 1)
    ) {
      return;
    }

    const updated = [...guideData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order
    updated.forEach((section, i) => {
      section.order = i + 1;
    });

    setGuideData({
      ...guideData,
      sections: updated
    });

    // Move active tab too
    setActiveTab(newIndex);
  };

  const saveDraft = async () => {
    if (!validateGuide()) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const url = '/api/hosted-guides';
      const method = guideId ? 'PUT' : 'POST';

      const payload = {
        ...guideData,
        publishStatus: 'draft'
      };

      if (guideId) {
        payload.id = guideId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save guide');
      }

      alert('Draft saved successfully!');

      if (onSaveSuccess) {
        onSaveSuccess(result.guide);
      }

    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save draft: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const publishGuide = async () => {
    if (!validateGuide()) {
      return;
    }

    if (!window.confirm('Are you sure you want to publish this guide? It will be visible to all users.')) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken');
      const url = '/api/hosted-guides';
      const method = guideId ? 'PUT' : 'POST';

      const payload = {
        ...guideData,
        publishStatus: 'published'
      };

      if (guideId) {
        payload.id = guideId;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish guide');
      }

      alert('Guide published successfully!');

      if (onSaveSuccess) {
        onSaveSuccess(result.guide);
      }

    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish guide: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const validateGuide = () => {
    if (!guideData.title.trim()) {
      alert('Please enter a guide title');
      return false;
    }

    if (!guideData.deckId) {
      alert('Please select a deck');
      return false;
    }

    for (let i = 0; i < guideData.sections.length; i++) {
      const section = guideData.sections[i];

      if (!section.title.trim()) {
        alert(`Section ${i + 1} needs a title`);
        setActiveTab(i);
        return false;
      }

      if (section.type === 'matchups' && section.matchups.length === 0) {
        const proceed = window.confirm(`Matchups section "${section.title}" has no matchups. Continue anyway?`);
        if (!proceed) {
          setActiveTab(i);
          return false;
        }
      }

      if (section.type === 'matchups') {
        for (let j = 0; j < section.matchups.length; j++) {
          const matchup = section.matchups[j];
          if (!matchup.opposingDeckId) {
            alert(`Matchup ${j + 1} in "${section.title}" needs an opposing deck`);
            setActiveTab(i);
            return false;
          }
        }
      }
    }

    return true;
  };

  const getSelectedDeck = () => {
    return decks.find(d => d.id === parseInt(guideData.deckId));
  };

  if (loading) {
    return (
      <div className="guide-editor-container">
        <div className="loading-state">Loading guide...</div>
      </div>
    );
  }

  const selectedDeck = getSelectedDeck();

  return (
    <div className="guide-editor-container">
      <div className="guide-editor-header">
        <h1>{guideId ? 'Edit Guide' : 'Create New Guide'}</h1>
        <div className="header-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={saveDraft}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={publishGuide}
            className="btn btn-success"
            disabled={saving}
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="guide-basic-info">
        <div className="form-row">
          <div className="form-group">
            <label>Guide Title *</label>
            <input
              type="text"
              value={guideData.title}
              onChange={(e) => setGuideData({ ...guideData, title: e.target.value })}
              placeholder="e.g., Complete Charizard ex Guide"
              className="title-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Deck *</label>
            <select
              value={guideData.deckId}
              onChange={(e) => setGuideData({ ...guideData, deckId: e.target.value })}
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
              <div className="selected-deck-icons">
                {JSON.parse(selectedDeck.icons).map((icon, i) => (
                  <img key={i} src={icon} alt="" className="deck-icon" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Thumbnail URL (optional)</label>
          <input
            type="text"
            value={guideData.thumbnail}
            onChange={(e) => setGuideData({ ...guideData, thumbnail: e.target.value })}
            placeholder="https://example.com/thumbnail.jpg"
            className="thumbnail-input"
          />
          {guideData.thumbnail && (
            <div className="thumbnail-preview">
              <img src={guideData.thumbnail} alt="Thumbnail preview" />
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="guide-sections">
        <div className="sections-header">
          <h2>Guide Sections</h2>
          <button onClick={addSection} className="btn btn-primary btn-sm">
            + Add Section
          </button>
        </div>

        {/* Section Tabs */}
        <div className="section-tabs">
          {guideData.sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`section-tab ${activeTab === index ? 'active' : ''}`}
            >
              {section.title || 'Untitled Section'}
              {section.type === 'matchups' && (
                <span className="matchup-count">
                  ({section.matchups?.length || 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Section */}
        {guideData.sections.map((section, index) => (
          <div
            key={index}
            className={`section-editor ${activeTab === index ? 'active' : ''}`}
          >
            <div className="section-controls">
              <div className="section-order-controls">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="btn-icon"
                  title="Move up"
                >
                  ↑
                </button>
                <span className="section-number">Section {index + 1}</span>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === guideData.sections.length - 1}
                  className="btn-icon"
                  title="Move down"
                >
                  ↓
                </button>
              </div>

              <button
                onClick={() => removeSection(index)}
                className="btn btn-danger btn-sm"
                disabled={guideData.sections.length === 1}
              >
                Remove Section
              </button>
            </div>

            <div className="section-meta">
              <div className="form-group">
                <label>Section Type</label>
                <select
                  value={section.type}
                  onChange={(e) => updateSection(index, 'type', e.target.value)}
                  className="section-type-select"
                >
                  {SECTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                  placeholder="Enter section title"
                  className="section-title-input"
                />
              </div>
            </div>

            {/* Section Content */}
            {section.type === 'matchups' ? (
              <MatchupsBuilder
                matchups={section.matchups || []}
                onChange={(matchups) => updateSection(index, 'matchups', matchups)}
              />
            ) : (
              <RichTextEditor
                content={section.content}
                onChange={(content) => updateSection(index, 'content', content)}
                placeholder={`Write the ${section.title} content here...`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="guide-editor-footer">
        <button
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={saving}
        >
          Cancel
        </button>
        <div className="footer-actions">
          <button
            onClick={saveDraft}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={publishGuide}
            className="btn btn-success"
            disabled={saving}
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideEditorStandalone;
