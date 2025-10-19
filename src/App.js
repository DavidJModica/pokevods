import { useState, useEffect } from 'react';
import './App.css';

// Format date for Mega Evolutions format (Sept 26, 2025)
const MEGA_EVOLUTIONS_FORMAT_DATE = new Date('2025-09-26');

function App() {
  const [decks, setDecks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAddDeck, setShowAddDeck] = useState(false);
  const [newDeck, setNewDeck] = useState({
    name: '',
    archetype: '',
    format: 'Standard',
    description: '',
    deckList: '',
    icon1: '',
    icon2: ''
  });
  const [newResource, setNewResource] = useState({
    type: 'Guide',
    title: '',
    url: '',
    author: '',
    platform: 'YouTube',
    accessType: 'Free',
    publicationDate: '',
    thumbnail: '',
    decklist: ''
  });
  const [fetchingYouTube, setFetchingYouTube] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [newChapter, setNewChapter] = useState({
    timestamp: '',
    title: '',
    chapterType: 'Guide',
    opposingDeckId: null
  });
  const [deckSearch, setDeckSearch] = useState('');
  const [showDeckDropdown, setShowDeckDropdown] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedDecklists, setExpandedDecklists] = useState({});
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [matchupFilter, setMatchupFilter] = useState(null);
  const [matchupSearch, setMatchupSearch] = useState('');
  const [showMatchupDropdown, setShowMatchupDropdown] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editDeckSearch, setEditDeckSearch] = useState('');
  const [showEditDeckDropdown, setShowEditDeckDropdown] = useState(false);
  const [parsedChapters, setParsedChapters] = useState([]);
  const [bulkImportSource, setBulkImportSource] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [singleVideoDeckSearch, setSingleVideoDeckSearch] = useState('');
  const [showSingleVideoDeckDropdown, setShowSingleVideoDeckDropdown] = useState(false);
  const [selectedSingleVideoDeck, setSelectedSingleVideoDeck] = useState(null);
  const [pendingResources, setPendingResources] = useState([]);
  const [showReviewQueue, setShowReviewQueue] = useState(false);
  const [matchupResources, setMatchupResources] = useState([]);
  const [showMatchupQueue, setShowMatchupQueue] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'deck', 'admin', 'author'
  const [importResults, setImportResults] = useState(null);
  const [adminTab, setAdminTab] = useState('bulkImport'); // 'bulkImport', 'reviewQueue', 'matchupQueue'
  const [editingDeck, setEditingDeck] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editChapterDeckSearch, setEditChapterDeckSearch] = useState('');
  const [showEditChapterDeckDropdown, setShowEditChapterDeckDropdown] = useState(false);
  const [tierListResources, setTierListResources] = useState([]);
  const [tournamentResources, setTournamentResources] = useState([]);
  const [paidGuides, setPaidGuides] = useState([]);

  // Resource filters for deck page
  const [resourceTypeFilters, setResourceTypeFilters] = useState({
    'Guide': true,
    'Gameplay': true,
    'Guide and Gameplay': true,
    'Discussion': true,
    'Tournament Report': true,
    'Tierlist': true,
    'Metagame Discussion': true
  });
  const [accessTypeFilters, setAccessTypeFilters] = useState({
    'Free': true,
    'Paid': true
  });
  const [platformFilters, setPlatformFilters] = useState({
    'YouTube': true,
    'Metafy': true,
    'Other': true
  });
  const [showOutOfDate, setShowOutOfDate] = useState(false);

  // Fetch all decks and special resources on load
  useEffect(() => {
    fetchDecks();
    fetchTierListResources();
    fetchTournamentResources();
    fetchPaidGuidesResources();
  }, []);

  // Close deck dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDeckDropdown && !e.target.closest('.deck-search-dropdown') && !e.target.closest('input[placeholder="Search for opposing deck..."]')) {
        setShowDeckDropdown(false);
      }
      if (showSearchDropdown && !e.target.closest('.main-search-dropdown') && !e.target.closest('input[placeholder="Search decks by name, archetype, or description..."]')) {
        setShowSearchDropdown(false);
      }
      if (showMatchupDropdown && !e.target.closest('.matchup-filter-dropdown') && !e.target.closest('input[placeholder="Filter by matchup..."]')) {
        setShowMatchupDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeckDropdown, showSearchDropdown, showMatchupDropdown]);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/decks');
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTierListResources = async () => {
    try {
      const response = await fetch('/api/resources?type=Tierlist');
      const data = await response.json();
      // Sort by publication date, newest first
      const sorted = data.sort((a, b) => {
        const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(0);
        const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(0);
        return dateB - dateA;
      });
      setTierListResources(sorted);
    } catch (error) {
      console.error('Error fetching tier list resources:', error);
    }
  };

  const fetchTournamentResources = async () => {
    try {
      const response = await fetch('/api/resources?type=Tournament%20Report');
      const data = await response.json();
      // Sort by publication date, newest first
      const sorted = data.sort((a, b) => {
        const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(0);
        const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(0);
        return dateB - dateA;
      });
      setTournamentResources(sorted);
    } catch (error) {
      console.error('Error fetching tournament resources:', error);
    }
  };

  const fetchPaidGuidesResources = async () => {
    try {
      const response = await fetch('/api/resources?accessType=Paid');
      const data = await response.json();
      // Sort by publication date, newest first
      const sorted = data.sort((a, b) => {
        const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(0);
        const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(0);
        return dateB - dateA;
      });
      setPaidGuides(sorted);
    } catch (error) {
      console.error('Error fetching paid guides:', error);
    }
  };

  const fetchDeckById = async (id) => {
    try {
      const response = await fetch(`/api/decks?id=${id}`);
      const data = await response.json();
      setSelectedDeck(data);
    } catch (error) {
      console.error('Error fetching deck:', error);
    }
  };

  const fetchAuthorBySlug = async (slug) => {
    try {
      const response = await fetch(`/api/authors?slug=${slug}`);
      const data = await response.json();
      setSelectedAuthor(data);
      setCurrentView('author');
    } catch (error) {
      console.error('Error fetching author:', error);
    }
  };

  // Get sorted decks
  const getSortedDecks = () => {
    // Sort by resource count (highest first)
    return [...decks].sort((a, b) => {
      const aCount = a.resources?.length || 0;
      const bCount = b.resources?.length || 0;
      return bCount - aCount;
    });
  };

  const handleAddDeck = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDeck)
      });

      if (response.ok) {
        setShowAddDeck(false);
        setNewDeck({
          name: '',
          archetype: '',
          format: 'Standard',
          description: '',
          deckList: '',
          icon1: '',
          icon2: ''
        });
        fetchDecks();
      }
    } catch (error) {
      console.error('Error adding deck:', error);
    }
  };

  const handleUpdateDeck = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/decks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingDeck)
      });

      if (response.ok) {
        setEditingDeck(null);
        // Refresh the deck data
        fetchDeckById(editingDeck.id);
      }
    } catch (error) {
      console.error('Error updating deck:', error);
    }
  };

  const handleFetchYouTubeData = async () => {
    if (!newResource.url) {
      alert('Please enter a YouTube URL first');
      return;
    }

    setFetchingYouTube(true);
    try {
      const response = await fetch(`/api/youtube?url=${encodeURIComponent(newResource.url)}`);
      const data = await response.json();

      if (response.ok) {
        // Format the publication date for the date input (YYYY-MM-DD)
        let formattedDate = newResource.publicationDate;
        if (data.publicationDate) {
          const date = new Date(data.publicationDate);
          formattedDate = date.toISOString().split('T')[0];
        }

        // If we have author name and channel URL, update or create the author profile
        if (data.author && data.authorUrl) {
          try {
            const slug = data.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Check if author exists
            const authorsResponse = await fetch('/api/authors');
            const authors = await authorsResponse.json();
            const existingAuthor = authors.find(a => a.slug === slug);

            if (existingAuthor) {
              // Update existing author with YouTube URL and profile picture if not already set
              const updateData = {};
              if (!existingAuthor.youtube) {
                updateData.youtube = data.authorUrl;
              }
              if (!existingAuthor.profilePicture && data.authorAvatar) {
                updateData.profilePicture = data.authorAvatar;
              }

              if (Object.keys(updateData).length > 0) {
                await fetch('/api/authors', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: existingAuthor.id,
                    ...updateData
                  })
                });
                console.log(`Updated author ${data.author}:`, updateData);
              }
            } else {
              // Create new author with YouTube URL and profile picture
              await fetch('/api/authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: data.author,
                  youtube: data.authorUrl,
                  profilePicture: data.authorAvatar
                })
              });
              console.log(`Created new author ${data.author} with YouTube data`);
            }
          } catch (authorError) {
            console.error('Error updating author:', authorError);
            // Continue even if author update fails
          }
        }

        setNewResource({
          ...newResource,
          title: data.title || newResource.title,
          author: data.author || newResource.author,
          platform: data.platform || newResource.platform,
          thumbnail: data.thumbnail || newResource.thumbnail,
          publicationDate: formattedDate,
          decklist: data.decklist || newResource.decklist
        });

        // Store parsed chapters to be added after resource creation
        if (data.chapters && data.chapters.length > 0) {
          setParsedChapters(data.chapters);
          alert(`Fetched ${data.chapters.length} chapters from video description. They will be added as "Guide" type chapters when you save the resource.`);
        }
      } else {
        alert(data.error || 'Failed to fetch YouTube data');
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      alert('Failed to fetch YouTube data');
    } finally {
      setFetchingYouTube(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();

    if (!selectedDeck) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newResource,
          deckId: selectedDeck.id
        })
      });

      if (response.ok) {
        const createdResource = await response.json();

        // If we have parsed chapters, add them automatically
        if (parsedChapters.length > 0) {
          try {
            for (const chapter of parsedChapters) {
              let chapterType = 'Guide';
              let opposingDeckId = null;

              // If marked as matchup, try to find the deck
              if (chapter.isMatchup && chapter.opposingDeckName) {
                chapterType = 'Matchup';

                const opponentNameLower = chapter.opposingDeckName.toLowerCase();

                // Normalize names by removing "ex" and extra spaces for matching
                const normalizeForMatching = (name) => {
                  return name.toLowerCase()
                    .replace(/\s+ex\b/g, '') // Remove " ex" suffix
                    .replace(/\b(ethan's|misty's|rocket's|iono's|lillie's)\s+/gi, '') // Remove trainer prefixes
                    .replace(/\s+/g, ' ') // Normalize spaces
                    .trim();
                };

                const normalizedOpponent = normalizeForMatching(opponentNameLower);

                // Extract the first Pokemon name (usually the primary deck Pokemon)
                // Match words that start with uppercase or are common Pokemon names
                const firstPokemonMatch = normalizedOpponent.match(/^(mega\s+)?(\w+)/i);
                const firstPokemon = firstPokemonMatch ? firstPokemonMatch[0].trim() : '';

                // Try to find matching deck by name with improved matching algorithm
                // Priority: 1. Exact match, 2. Normalized match, 3. Starts with first Pokemon, 4. Longest substring match
                let matchingDeck = null;
                let bestMatchScore = 0;
                let bestFirstPokemonMatch = null;

                for (const deck of decks) {
                  const deckNameLower = deck.name.toLowerCase();
                  const normalizedDeck = normalizeForMatching(deckNameLower);

                  // Exact match gets highest priority
                  if (deckNameLower === opponentNameLower) {
                    matchingDeck = deck;
                    break;
                  }

                  // Normalized exact match (ignoring "ex" and trainer names)
                  if (normalizedDeck === normalizedOpponent) {
                    matchingDeck = deck;
                    break;
                  }

                  // Check if deck starts with the first Pokemon mentioned
                  if (firstPokemon && normalizedDeck.startsWith(firstPokemon)) {
                    if (!bestFirstPokemonMatch || normalizedDeck.length > normalizeForMatching(bestFirstPokemonMatch.name).length) {
                      bestFirstPokemonMatch = deck;
                    }
                  }

                  // Calculate match score for substring matching
                  let score = 0;

                  // Check if normalized deck name is contained in normalized opponent name
                  if (normalizedOpponent.includes(normalizedDeck)) {
                    score = normalizedDeck.length;
                  }
                  // Check if normalized opponent name is contained in normalized deck name
                  else if (normalizedDeck.includes(normalizedOpponent)) {
                    score = normalizedOpponent.length;
                  }

                  // Use the deck with the longest match
                  if (score > bestMatchScore) {
                    bestMatchScore = score;
                    matchingDeck = deck;
                  }
                }

                // If we found a deck that starts with the first Pokemon, prefer it over substring matches
                if (bestFirstPokemonMatch && !matchingDeck) {
                  matchingDeck = bestFirstPokemonMatch;
                } else if (bestFirstPokemonMatch && matchingDeck && bestMatchScore < firstPokemon.length * 2) {
                  // Prefer first Pokemon match if the substring match score is weak
                  matchingDeck = bestFirstPokemonMatch;
                }

                if (matchingDeck) {
                  opposingDeckId = matchingDeck.id;
                  console.log(`Matched chapter "${chapter.title}" to deck: ${matchingDeck.name}`);
                } else {
                  console.log(`Could not find deck for: ${chapter.opposingDeckName}`);
                }
              }

              await fetch('/api/chapters', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  resourceId: createdResource.id,
                  timestamp: chapter.timestamp,
                  title: chapter.title,
                  chapterType: chapterType,
                  opposingDeckId: opposingDeckId
                })
              });
            }
            console.log(`Added ${parsedChapters.length} chapters to resource`);
          } catch (chapterError) {
            console.error('Error adding parsed chapters:', chapterError);
          }
        }

        // Reset form and parsed chapters
        setNewResource({
          type: 'Guide',
          title: '',
          url: '',
          author: '',
          platform: 'YouTube',
          accessType: 'Free',
          publicationDate: '',
          thumbnail: '',
          decklist: ''
        });
        setParsedChapters([]);

        // Refresh the deck to show new resource
        fetchDeckById(selectedDeck.id);
      } else if (response.status === 409) {
        // Duplicate URL
        const errorData = await response.json();
        alert(`Duplicate video: "${errorData.existingResourceTitle}" already exists in the database.`);
      } else {
        const errorData = await response.json();
        alert(`Error adding resource: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource');
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();

    if (!editingResource) return;

    try {
      const response = await fetch('/api/resources', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingResource)
      });

      if (response.ok) {
        setEditingResource(null);
        // Refresh the appropriate view
        if (selectedDeck) {
          fetchDeckById(selectedDeck.id);
        } else if (selectedAuthor) {
          fetchAuthorBySlug(selectedAuthor.slug);
        } else {
          // On homepage, refresh pending resources if needed
          if (currentView === 'admin') {
            fetchPendingResources();
          }
        }
      }
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;

    try {
      const response = await fetch(`/api/resources?id=${resourceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDeckById(selectedDeck.id);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleAddChapter = async (e, resourceId) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newChapter,
          resourceId: resourceId,
          opposingDeckId: newChapter.opposingDeckId ? parseInt(newChapter.opposingDeckId) : null
        })
      });

      if (response.ok) {
        setNewChapter({
          timestamp: '',
          title: '',
          chapterType: 'Guide',
          opposingDeckId: null
        });
        fetchDeckById(selectedDeck.id);
      }
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter?')) return;

    try {
      const response = await fetch(`/api/chapters?id=${chapterId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDeckById(selectedDeck.id);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();

    if (!editingChapter) return;

    try {
      const response = await fetch(`/api/chapters?id=${editingChapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingChapter.title || '',
          timestamp: editingChapter.timestamp,
          chapterType: editingChapter.chapterType || 'Guide',
          opposingDeckId: editingChapter.opposingDeckId || null
        })
      });

      if (response.ok) {
        setEditingChapter(null);
        fetchDeckById(selectedDeck.id);
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();

    if (!bulkImportSource.trim()) {
      alert('Please enter a YouTube channel, playlist URL, or video URLs');
      return;
    }

    setBulkImporting(true);
    setImportResults(null);

    try {
      const response = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: bulkImportSource
        })
      });

      const data = await response.json();

      if (response.ok) {
        setImportResults(data);

        const approvedCount = data.results.filter(r => r.success && r.status === 'approved').length;
        const pendingCount = data.results.filter(r => r.success && r.status === 'pending').length;
        const failedCount = data.results.filter(r => !r.success).length;
        const noDeckCount = data.results.filter(r => !r.success && r.needsManualDeck).length;

        alert(`Bulk import complete!\n\nApproved: ${approvedCount}\nPending Review: ${pendingCount}\nNo Deck Detected: ${noDeckCount}\nFailed: ${failedCount - noDeckCount}`);

        if (pendingCount > 0 || noDeckCount > 0) {
          fetchPendingResources();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      alert('Failed to import videos');
    } finally {
      setBulkImporting(false);
    }
  };

  const fetchPendingResources = async () => {
    try {
      const response = await fetch('/api/resources?status=pending');
      const data = await response.json();
      setPendingResources(data);
    } catch (error) {
      console.error('Error fetching pending resources:', error);
    }
  };

  const fetchMatchupResources = async () => {
    try {
      const response = await fetch('/api/resources/matchup-queue');
      const data = await response.json();
      setMatchupResources(data);
    } catch (error) {
      console.error('Error fetching matchup resources:', error);
    }
  };

  const handleApproveResource = async (resourceId, resourceData = null) => {
    try {
      // Use provided resourceData or editingResource
      const dataToSend = resourceData || editingResource;

      const response = await fetch('/api/resources', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: resourceId,
          ...dataToSend,
          status: 'approved'
        })
      });

      if (response.ok) {
        setEditingResource(null);
        await fetchPendingResources();
        if (selectedDeck) {
          fetchDeckById(selectedDeck.id);
        }
      }
    } catch (error) {
      console.error('Error approving resource:', error);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return '📺';
      case 'limitlesstcg': return '🎮';
      case 'pokebeach': return '🏖️';
      case 'twitch': return '💜';
      default: return '🌐';
    }
  };

  // Convert timestamp to seconds for sorting
  const timestampToSeconds = (timestamp) => {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  // Sort chapters by timestamp
  const sortChaptersByTime = (chapters) => {
    return [...chapters].sort((a, b) => {
      return timestampToSeconds(a.timestamp) - timestampToSeconds(b.timestamp);
    });
  };

  // Create YouTube timestamped URL
  const getYouTubeTimestampedURL = (videoUrl, timestamp) => {
    const seconds = timestampToSeconds(timestamp);
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}t=${seconds}`;
    }
    return videoUrl;
  };

  // Author Page View
  if (selectedAuthor) {
    return (
      <div className="App">
        <header className="header">
          <button onClick={() => {
            setSelectedAuthor(null);
            setCurrentView('home');
          }} className="back-btn">
            ← Back to Home
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1>🎴 PokeVods</h1>
            <p className="subtitle">Pokemon TCG Deck Resources</p>
          </div>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="btn btn-admin"
          >
            {showAdmin ? '🔒 Admin' : '🔓 Admin'}
          </button>
        </header>

        <div className="deck-detail">
          <div className="deck-header">
            {/* Profile Picture */}
            {selectedAuthor.profilePicture ? (
              <div className="deck-header-icon">
                <img
                  src={selectedAuthor.profilePicture}
                  alt={selectedAuthor.name}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div className="deck-header-icon">
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {selectedAuthor.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <div className="deck-header-info">
              <h2>{selectedAuthor.name}</h2>
              {selectedAuthor.bio && (
                <p className="deck-description" style={{ marginTop: '1rem' }}>{selectedAuthor.bio}</p>
              )}

              {/* Social Links */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {selectedAuthor.youtube && (
                  <a href={selectedAuthor.youtube} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#FF0000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📺</span> YouTube
                  </a>
                )}
                {selectedAuthor.twitter && (
                  <a href={selectedAuthor.twitter} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#1DA1F2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🐦</span> Twitter
                  </a>
                )}
                {selectedAuthor.twitch && (
                  <a href={selectedAuthor.twitch} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#9146FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📺</span> Twitch
                  </a>
                )}
                {selectedAuthor.discord && (
                  <a href={selectedAuthor.discord} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#5865F2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💬</span> Discord
                  </a>
                )}
                {selectedAuthor.website && (
                  <a href={selectedAuthor.website} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#007bff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🌐</span> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="resources-section">
            <h3>Resources ({selectedAuthor.resources?.length || 0})</h3>

            {selectedAuthor.resources && selectedAuthor.resources.length > 0 ? (
              <div className="resources-list">
                {selectedAuthor.resources.map(resource => {
                  const icons = resource.deck?.icons ? JSON.parse(resource.deck.icons) : [];
                  return (
                    <div key={resource.id} className="resource-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            {resource.deck && (
                              <div className="deck-icons-group" style={{ display: 'flex', gap: '0.25rem' }}>
                                {icons.length > 0 ? (
                                  icons.slice(0, 2).map((iconPath, idx) => (
                                    <img key={idx} src={iconPath} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
                                  ))
                                ) : (
                                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                                )}
                              </div>
                            )}
                            <div>
                              {resource.deck ? (
                                <strong>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSelectedAuthor(null);
                                      setCurrentView('deck');
                                      fetchDeckById(resource.deck.id);
                                    }}
                                    style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                  >
                                    {resource.deck.name}
                                  </a>
                                </strong>
                              ) : (
                                <strong>General Resource</strong>
                              )}
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {resource.type} • {resource.platform}
                                {resource.publicationDate && new Date(resource.publicationDate) < MEGA_EVOLUTIONS_FORMAT_DATE && (
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    padding: '0.125rem 0.5rem',
                                    backgroundColor: '#ffc107',
                                    color: '#000',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                  }}>
                                    OUT OF DATE
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                              {resource.title}
                            </a>
                          </h4>

                          {/* Admin Edit Button */}
                          {showAdmin && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  setEditingResource(resource);
                                  setEditDeckSearch(resource.deck?.name || '');
                                  setShowEditDeckDropdown(false);
                                }}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          )}
                        </div>
                        {resource.thumbnail && (
                          <img src={resource.thumbnail} alt={resource.title} className="resource-thumbnail" />
                        )}
                      </div>

                      {resource.chapters && resource.chapters.length > 0 && (
                        <div className="chapters-list">
                          <strong>Chapters:</strong>
                          {resource.chapters.map((chapter, idx) => {
                            const chapterIcons = chapter.opposingDeck?.icons ? JSON.parse(chapter.opposingDeck.icons) : [];
                            return (
                              <div key={idx} className="chapter-item">
                                <a
                                  href={getYouTubeTimestampedURL(resource.url, chapter.timestamp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="chapter-link"
                                >
                                  <span className="chapter-timestamp">{chapter.timestamp}</span>
                                  {chapter.chapterType === 'Matchup' && chapter.opposingDeck ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                      <div className="deck-icons-group" style={{ display: 'flex', gap: '0.25rem' }}>
                                        {chapterIcons.length > 0 ? (
                                          chapterIcons.slice(0, 2).map((iconPath, iconIdx) => (
                                            <img key={iconIdx} src={iconPath} alt="" style={{ width: '24px', height: '24px', borderRadius: '3px' }} />
                                          ))
                                        ) : null}
                                      </div>
                                      <span>vs {chapter.opposingDeck.name}</span>
                                    </div>
                                  ) : (
                                    <span>{chapter.title || 'Guide'}</span>
                                  )}
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No resources yet.</p>
            )}
          </div>
        </div>

        {/* Edit Resource Modal */}
        {editingResource && (
          <div className="edit-resource-overlay" onClick={() => setEditingResource(null)}>
            <div className="edit-resource-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Edit Resource</h4>
              <form onSubmit={handleUpdateResource}>
                <div className="form-row">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder={editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion' ? 'Search deck (optional)' : 'Search deck *'}
                      value={editDeckSearch}
                      onChange={(e) => {
                        setEditDeckSearch(e.target.value);
                        setShowEditDeckDropdown(true);
                      }}
                      onFocus={() => setShowEditDeckDropdown(true)}
                      style={{ width: '100%' }}
                    />
                    {showEditDeckDropdown && editDeckSearch && (
                      <div className="deck-search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
                        {decks
                          .filter(deck => deck.name.toLowerCase().includes(editDeckSearch.toLowerCase()))
                          .slice(0, 10)
                          .map(deck => {
                            const icons = deck.icons ? JSON.parse(deck.icons) : [];
                            return (
                              <div
                                key={deck.id}
                                className="deck-search-item"
                                onClick={() => {
                                  setEditingResource({ ...editingResource, deckId: deck.id });
                                  setEditDeckSearch(deck.name);
                                  setShowEditDeckDropdown(false);
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {icons.map((icon, i) => (
                                    <img key={i} src={icon} alt="" style={{ width: '24px', height: '24px' }} />
                                  ))}
                                  <span>{deck.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        {decks.filter(deck => deck.name.toLowerCase().includes(editDeckSearch.toLowerCase())).length === 0 && (
                          <div className="deck-search-item" style={{ color: '#999' }}>No decks found</div>
                        )}
                      </div>
                    )}
                    {editingResource.deckId && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
                        Selected: <strong>{decks.find(d => d.id === editingResource.deckId)?.name}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResource({ ...editingResource, deckId: null });
                            setEditDeckSearch('');
                          }}
                          style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <select
                    value={editingResource.type}
                    onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value })}
                    required
                  >
                    <option value="Guide">Guide</option>
                    <option value="Gameplay">Gameplay</option>
                    <option value="Guide and Gameplay">Guide and Gameplay</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Tournament Report">Tournament Report</option>
                    <option value="Tierlist">Tierlist</option>
                    <option value="Metagame Discussion">Metagame Discussion</option>
                  </select>
                </div>
                {(editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion') && (
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    Note: Deck selection is optional for {editingResource.type} resources.
                  </div>
                )}
                <div className="form-row">
                  <input
                    type="url"
                    placeholder="URL *"
                    value={editingResource.url}
                    onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Title *"
                    value={editingResource.title}
                    onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={editingResource.author || ''}
                    onChange={(e) => setEditingResource({ ...editingResource, author: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Decklist (optional)"
                  value={editingResource.decklist || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, decklist: e.target.value })}
                  rows="8"
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem', width: '100%', marginTop: '0.5rem' }}
                />

                {/* Chapters Section */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ margin: 0 }}>Chapters ({editingResource.chapters?.length || 0})</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        const newChapter = { title: '', timestamp: '', opponentDeck: '' };
                        setEditingResource({
                          ...editingResource,
                          chapters: [...(editingResource.chapters || []), newChapter]
                        });
                      }}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                    >
                      + Add Chapter
                    </button>
                  </div>

                  {editingResource.chapters && editingResource.chapters.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {editingResource.chapters.map((chapter, index) => (
                        <div key={index} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Timestamp (e.g., 1:23)"
                              value={chapter.timestamp || ''}
                              onChange={(e) => {
                                const updatedChapters = [...editingResource.chapters];
                                updatedChapters[index] = { ...updatedChapters[index], timestamp: e.target.value };
                                setEditingResource({ ...editingResource, chapters: updatedChapters });
                              }}
                              style={{ flex: '0 0 120px', padding: '0.5rem', fontSize: '0.9rem' }}
                            />
                            <input
                              type="text"
                              placeholder="Title"
                              value={chapter.title || ''}
                              onChange={(e) => {
                                const updatedChapters = [...editingResource.chapters];
                                updatedChapters[index] = { ...updatedChapters[index], title: e.target.value };
                                setEditingResource({ ...editingResource, chapters: updatedChapters });
                              }}
                              style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedChapters = editingResource.chapters.filter((_, i) => i !== index);
                                setEditingResource({ ...editingResource, chapters: updatedChapters });
                              }}
                              style={{ padding: '0.5rem 0.75rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              ✗
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Opponent Deck (optional)"
                            value={chapter.opponentDeck || ''}
                            onChange={(e) => {
                              const updatedChapters = [...editingResource.chapters];
                              updatedChapters[index] = { ...updatedChapters[index], opponentDeck: e.target.value };
                              setEditingResource({ ...editingResource, chapters: updatedChapters });
                            }}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', margin: '1rem 0' }}>No chapters yet. Click "Add Chapter" to create one.</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  {editingResource.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleApproveResource(editingResource.id)}
                      style={{ backgroundColor: '#28a745', color: 'white' }}
                    >
                      Approve & Save
                    </button>
                  )}
                  <button type="button" onClick={() => setEditingResource(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedDeck) {
    return (
      <div className="App">
        <header className="header">
          <button onClick={() => setSelectedDeck(null)} className="back-btn">
            ← Back to Decks
          </button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1>🎴 PokeVods</h1>
            <p className="subtitle">Pokemon TCG Deck Resources</p>
          </div>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="btn btn-admin"
          >
            {showAdmin ? '🔒 Admin' : '🔓 Admin'}
          </button>
        </header>

        {/* Admin Toolbar */}
        <div style={{
          background: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          padding: '0.75rem 2rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="btn btn-admin"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            {showAdmin ? '🔒 Admin' : '🔓 Admin'}
          </button>
          {showAdmin && (
            <>
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setAdminTab('bulkImport');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                ⚙️ Admin Panel
              </button>
              <button
                onClick={() => {
                  fetchPendingResources();
                  setCurrentView('admin');
                  setAdminTab('reviewQueue');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                📋 Review Queue {pendingResources.length > 0 && `(${pendingResources.length})`}
              </button>
              <button
                onClick={() => {
                  const icons = selectedDeck.icons ? JSON.parse(selectedDeck.icons) : [];
                  setEditingDeck({
                    id: selectedDeck.id,
                    name: selectedDeck.name,
                    icon1: icons[0] || '',
                    icon2: icons[1] || ''
                  });
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                ✏️ Edit Deck
              </button>
            </>
          )}
        </div>

        <div className="deck-detail">
          <div className="deck-header">
            {selectedDeck.icon && (
              <div className="deck-header-icon">
                <img src={selectedDeck.icon} alt={selectedDeck.name} />
              </div>
            )}
            <div className="deck-header-info">
              <h2>{selectedDeck.name}</h2>
              <div className="deck-meta">
                <span className="badge format-badge">{selectedDeck.format}</span>
                <span className="badge archetype-badge">{selectedDeck.archetype}</span>
              </div>
              {selectedDeck.description && (
                <p className="deck-description">{selectedDeck.description}</p>
              )}
            </div>
          </div>

          {selectedDeck.deckList && (
            <div className="decklist-section">
              <h3>Deck List</h3>
              <pre className="decklist">{selectedDeck.deckList}</pre>
            </div>
          )}

          <div className="resources-section">
            <div className="resources-header">
              <h3>Resources ({selectedDeck.resources?.length || 0})</h3>
              <div className="matchup-filter" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Filter by matchup..."
                  value={matchupSearch}
                  onChange={(e) => {
                    setMatchupSearch(e.target.value);
                    setShowMatchupDropdown(true);
                    if (!e.target.value) {
                      setMatchupFilter(null);
                    }
                  }}
                  onFocus={() => setShowMatchupDropdown(true)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e0e0e0' }}
                />
                {matchupFilter && (
                  <button
                    onClick={() => {
                      setMatchupFilter(null);
                      setMatchupSearch('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                )}
                {showMatchupDropdown && matchupSearch && (
                  <div className="matchup-filter-dropdown deck-search-dropdown">
                    {decks
                      .filter(deck =>
                        deck.name.toLowerCase().includes(matchupSearch.toLowerCase())
                      )
                      .slice(0, 10)
                      .map(deck => {
                        const icons = deck.icons ? JSON.parse(deck.icons) : [];
                        return (
                          <div
                            key={deck.id}
                            className="deck-search-item"
                            onClick={() => {
                              setMatchupFilter(deck.id);
                              setMatchupSearch(deck.name);
                              setShowMatchupDropdown(false);
                            }}
                          >
                            <div className="deck-icons-group">
                              {icons.length > 0 ? (
                                icons.slice(0, 2).map((iconPath, idx) => (
                                  <img key={idx} src={iconPath} alt="" className="deck-search-icon" />
                                ))
                              ) : (
                                <div className="deck-search-icon-placeholder">?</div>
                              )}
                            </div>
                            <span>{deck.name}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {showAdmin && (
              <form onSubmit={handleAddResource} className="add-resource-form">
                <h4>Add Resource</h4>
                <div className="form-row">
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    required
                  >
                    <option value="Guide">Guide</option>
                    <option value="Gameplay">Gameplay</option>
                    <option value="Guide and Gameplay">Guide and Gameplay</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Tournament Report">Tournament Report</option>
                    <option value="Tierlist">Tierlist</option>
                    <option value="Metagame Discussion">Metagame Discussion</option>
                  </select>
                  <select
                    value={newResource.platform}
                    onChange={(e) => setNewResource({ ...newResource, platform: e.target.value })}
                    required
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Metafy">Metafy</option>
                    <option value="Reddit">Reddit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="url"
                    placeholder="URL (YouTube or webpage) *"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    required
                    style={{ flex: 1 }}
                  />
                  {newResource.platform === 'YouTube' && (
                    <button
                      type="button"
                      onClick={handleFetchYouTubeData}
                      className="btn btn-secondary btn-small"
                      disabled={fetchingYouTube || !newResource.url}
                    >
                      {fetchingYouTube ? 'Fetching...' : '🔄 Fetch Info'}
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Title *"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={newResource.author}
                    onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <select
                    value={newResource.accessType}
                    onChange={(e) => setNewResource({ ...newResource, accessType: e.target.value })}
                    required
                  >
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Publication Date"
                    value={newResource.publicationDate}
                    onChange={(e) => setNewResource({ ...newResource, publicationDate: e.target.value })}
                  />
                </div>
                {newResource.thumbnail && (
                  <div className="thumbnail-preview">
                    <img src={newResource.thumbnail} alt="Thumbnail preview" />
                  </div>
                )}
                <textarea
                  placeholder="Decklist (optional)"
                  value={newResource.decklist}
                  onChange={(e) => setNewResource({ ...newResource, decklist: e.target.value })}
                  rows="8"
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem', width: '100%', marginTop: '0.5rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Resource</button>
              </form>
            )}

            {/* Filter Toggles - Compact */}
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.85rem' }}>
                {/* Type Filters */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <strong style={{ marginRight: '0.25rem' }}>Type:</strong>
                  {Object.keys(resourceTypeFilters).map(type => (
                    <button
                      key={type}
                      onClick={() => setResourceTypeFilters({ ...resourceTypeFilters, [type]: !resourceTypeFilters[type] })}
                      style={{
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '3px',
                        border: '1px solid',
                        borderColor: resourceTypeFilters[type] ? '#007bff' : '#ccc',
                        backgroundColor: resourceTypeFilters[type] ? '#007bff' : 'white',
                        color: resourceTypeFilters[type] ? 'white' : '#666',
                        cursor: 'pointer',
                        fontWeight: resourceTypeFilters[type] ? 'bold' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc' }}></div>

                {/* Access Filters */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <strong style={{ marginRight: '0.25rem' }}>Access:</strong>
                  {Object.keys(accessTypeFilters).map(type => (
                    <button
                      key={type}
                      onClick={() => setAccessTypeFilters({ ...accessTypeFilters, [type]: !accessTypeFilters[type] })}
                      style={{
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '3px',
                        border: '1px solid',
                        borderColor: accessTypeFilters[type] ? '#28a745' : '#ccc',
                        backgroundColor: accessTypeFilters[type] ? '#28a745' : 'white',
                        color: accessTypeFilters[type] ? 'white' : '#666',
                        cursor: 'pointer',
                        fontWeight: accessTypeFilters[type] ? 'bold' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc' }}></div>

                {/* Platform Filters */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <strong style={{ marginRight: '0.25rem' }}>Platform:</strong>
                  {Object.keys(platformFilters).map(platform => (
                    <button
                      key={platform}
                      onClick={() => setPlatformFilters({ ...platformFilters, [platform]: !platformFilters[platform] })}
                      style={{
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '3px',
                        border: '1px solid',
                        borderColor: platformFilters[platform] ? '#ffc107' : '#ccc',
                        backgroundColor: platformFilters[platform] ? '#ffc107' : 'white',
                        color: platformFilters[platform] ? '#000' : '#666',
                        cursor: 'pointer',
                        fontWeight: platformFilters[platform] ? 'bold' : 'normal'
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc' }}></div>

                {/* Out-of-Date Toggle */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <strong style={{ marginRight: '0.25rem' }}>Show Out-of-Date:</strong>
                  <button
                    onClick={() => setShowOutOfDate(!showOutOfDate)}
                    style={{
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '3px',
                      border: '1px solid',
                      borderColor: showOutOfDate ? '#dc3545' : '#ccc',
                      backgroundColor: showOutOfDate ? '#dc3545' : 'white',
                      color: showOutOfDate ? 'white' : '#666',
                      cursor: 'pointer',
                      fontWeight: showOutOfDate ? 'bold' : 'normal'
                    }}
                  >
                    {showOutOfDate ? 'Yes' : 'No'}
                  </button>
                </div>
              </div>
            </div>

            <div className="resources-list">
              {selectedDeck.resources?.length === 0 ? (
                <p className="no-resources">No resources yet. Add one above!</p>
              ) : (
                selectedDeck.resources
                  ?.filter(resource => {
                    // Filter by matchup if a matchup is selected
                    if (!matchupFilter) return true;
                    return resource.chapters?.some(chapter =>
                      chapter.chapterType === 'Matchup' && chapter.opposingDeckId === matchupFilter
                    );
                  })
                  .filter(resource => {
                    // Filter by resource type
                    if (!resourceTypeFilters[resource.type]) return false;
                    // Filter by access type
                    if (!accessTypeFilters[resource.accessType || 'Free']) return false;
                    // Filter by platform (treat non-YouTube/Metafy as "Other")
                    const platform = (resource.platform === 'YouTube' || resource.platform === 'Metafy') ? resource.platform : 'Other';
                    if (!platformFilters[platform]) return false;
                    // Filter by out-of-date status
                    const isOutOfDate = resource.publicationDate && new Date(resource.publicationDate) < MEGA_EVOLUTIONS_FORMAT_DATE;
                    if (!showOutOfDate && isOutOfDate) return false;
                    return true;
                  })
                  .sort((a, b) => {
                    // Sort by publication date, newest first
                    const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(0);
                    const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(0);
                    return dateB - dateA;
                  })
                  .map(resource => (
                  <div key={resource.id} className="resource-card">
                    <div className="resource-content">
                      {resource.thumbnail && (
                        <div className="resource-thumbnail">
                          <img src={resource.thumbnail} alt={resource.title} />
                        </div>
                      )}
                      <div className="resource-details">
                        <div className="resource-header-compact">
                          <h4 className="resource-title">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              {resource.title}
                            </a>
                            {resource.accessType === 'Paid' && (
                              <span className="badge paid-badge">💰 Paid</span>
                            )}
                          </h4>
                          {showAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  const pubDate = resource.publicationDate ? new Date(resource.publicationDate).toISOString().split('T')[0] : '';
                                  setEditingResource({
                                    id: resource.id,
                                    type: resource.type,
                                    title: resource.title,
                                    url: resource.url,
                                    author: resource.author || '',
                                    platform: resource.platform || 'YouTube',
                                    accessType: resource.accessType || 'Free',
                                    publicationDate: pubDate,
                                    thumbnail: resource.thumbnail || '',
                                    decklist: resource.decklist || ''
                                  });
                                }}
                                className="btn-small btn-secondary"
                                style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteResource(resource.id)}
                                className="delete-btn"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="resource-meta">
                          {resource.authorProfile ? (
                            <span>
                              by <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  fetchAuthorBySlug(resource.authorProfile.slug);
                                }}
                                style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                              >
                                {resource.authorProfile.name}
                              </a>
                            </span>
                          ) : resource.author ? (
                            <span>by {resource.author}</span>
                          ) : null}
                          {resource.platform && (
                            <span className="platform">
                              {getPlatformIcon(resource.platform)} {resource.platform}
                            </span>
                          )}
                          {resource.publicationDate && new Date(resource.publicationDate) < MEGA_EVOLUTIONS_FORMAT_DATE && (
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              OUT OF DATE
                            </span>
                          )}
                          {resource.publicationDate && (
                            <span className="pub-date">
                              📅 {new Date(resource.publicationDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Matchup Deck Icons */}
                        {resource.chapters && resource.chapters.filter(c => c.chapterType === 'Matchup' && c.opposingDeck).length > 0 && (
                          <div className="matchup-decks">
                            <span className="matchup-label">Matchups:</span>
                            <div className="matchup-icons-list">
                              {[...new Map(
                                resource.chapters
                                  .filter(c => c.chapterType === 'Matchup' && c.opposingDeck)
                                  .map(c => [c.opposingDeck.id, c.opposingDeck])
                              ).values()].map(deck => {
                                const icons = deck.icons ? JSON.parse(deck.icons) : [];
                                return (
                                  <div key={deck.id} className="matchup-deck-item" title={deck.name}>
                                    {icons.length > 0 ? (
                                      icons.slice(0, 2).map((iconPath, idx) => (
                                        <img key={idx} src={iconPath} alt="" className="matchup-deck-icon" />
                                      ))
                                    ) : (
                                      <div className="matchup-deck-icon-placeholder">?</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decklist Section - Collapsible */}
                    {resource.decklist && (
                      <div className="decklist-section">
                        <div
                          className="decklist-header"
                          onClick={() => setExpandedDecklists({
                            ...expandedDecklists,
                            [resource.id]: !expandedDecklists[resource.id]
                          })}
                        >
                          <h5>
                            <span className="expand-icon">{expandedDecklists[resource.id] ? '▼' : '▶'}</span>
                            Decklist
                          </h5>
                        </div>
                        {expandedDecklists[resource.id] && (
                          <pre className="decklist-content">{resource.decklist}</pre>
                        )}
                      </div>
                    )}

                    {/* Chapters Section - Collapsible */}
                    {resource.chapters && resource.chapters.length > 0 && (
                      <div className="chapters-section">
                        <div
                          className="chapters-header"
                          onClick={() => setExpandedChapters({
                            ...expandedChapters,
                            [resource.id]: !expandedChapters[resource.id]
                          })}
                        >
                          <h5>
                            <span className="expand-icon">{expandedChapters[resource.id] ? '▼' : '▶'}</span>
                            Chapters ({resource.chapters.length})
                          </h5>
                        </div>
                        {expandedChapters[resource.id] && (
                          <div className="chapters-list">
                            {sortChaptersByTime(resource.chapters).map(chapter => (
                              <div key={chapter.id} className="chapter-item">
                                <a
                                  href={getYouTubeTimestampedURL(resource.url, chapter.timestamp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="chapter-timestamp"
                                  style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                  {chapter.timestamp}
                                </a>
                                <a
                                  href={getYouTubeTimestampedURL(resource.url, chapter.timestamp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="chapter-title"
                                  style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                  {chapter.title || (chapter.chapterType === 'Matchup' && chapter.opposingDeck ? `vs ${chapter.opposingDeck.name}` : 'Untitled')}
                                </a>
                                <span className="chapter-type-badge">{chapter.chapterType}</span>
                                {showAdmin && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingChapter(chapter);
                                        setEditChapterDeckSearch(chapter.opposingDeck?.name || '');
                                        setShowEditChapterDeckDropdown(false);
                                      }}
                                      className="edit-btn-small"
                                      style={{ marginRight: '0.25rem' }}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteChapter(chapter.id)}
                                      className="delete-btn-small"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add Chapter Form (Admin Only) */}
                    {showAdmin && resource.platform?.toLowerCase() === 'youtube' && (
                      <div className="add-chapter-section">
                        <button
                          onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                          className="btn-small btn-secondary"
                        >
                          {selectedResource === resource.id ? 'Cancel' : '+ Add Chapter'}
                        </button>

                        {selectedResource === resource.id && (
                          <form onSubmit={(e) => handleAddChapter(e, resource.id)} className="add-chapter-form">
                            <div className="form-row">
                              <input
                                type="text"
                                placeholder="Timestamp (e.g., 12:34)"
                                value={newChapter.timestamp}
                                onChange={(e) => setNewChapter({ ...newChapter, timestamp: e.target.value })}
                                required
                              />
                              <input
                                type="text"
                                placeholder={newChapter.chapterType === 'Matchup' ? 'Title (optional)' : 'Title (optional)'}
                                value={newChapter.title}
                                onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                              />
                            </div>
                            <div className="form-row">
                              <select
                                value={newChapter.chapterType}
                                onChange={(e) => {
                                  setNewChapter({ ...newChapter, chapterType: e.target.value });
                                  if (e.target.value !== 'Matchup') {
                                    setNewChapter({ ...newChapter, chapterType: e.target.value, opposingDeckId: null });
                                    setDeckSearch('');
                                  }
                                }}
                                required
                              >
                                <option value="Guide">Guide</option>
                                <option value="Matchup">Matchup</option>
                              </select>
                              {newChapter.chapterType === 'Matchup' && (
                                <div style={{ flex: 1, position: 'relative' }}>
                                  <input
                                    type="text"
                                    placeholder="Search for opposing deck..."
                                    value={deckSearch}
                                    onChange={(e) => {
                                      setDeckSearch(e.target.value);
                                      setShowDeckDropdown(true);
                                    }}
                                    onFocus={() => setShowDeckDropdown(true)}
                                    required={!newChapter.opposingDeckId}
                                  />
                                  {showDeckDropdown && (
                                    <div className="deck-search-dropdown">
                                      {decks
                                        .filter(deck =>
                                          deck.name.toLowerCase().includes(deckSearch.toLowerCase())
                                        )
                                        .slice(0, 10)
                                        .map(deck => (
                                          <div
                                            key={deck.id}
                                            className="deck-search-item"
                                            onClick={() => {
                                              setNewChapter({ ...newChapter, opposingDeckId: deck.id });
                                              setDeckSearch(deck.name);
                                              setShowDeckDropdown(false);
                                            }}
                                          >
                                            <div className="deck-icons-group">
                                              {deck.icons ? (
                                                JSON.parse(deck.icons).slice(0, 2).map((iconPath, idx) => (
                                                  <img key={idx} src={iconPath} alt="" className="deck-search-icon" />
                                                ))
                                              ) : deck.icon ? (
                                                <img src={deck.icon} alt="" className="deck-search-icon" />
                                              ) : (
                                                <div className="deck-search-icon-placeholder">?</div>
                                              )}
                                            </div>
                                            <span>{deck.name}</span>
                                          </div>
                                        ))
                                      }
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <button type="submit" className="btn btn-primary btn-small">Add Chapter</button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Edit Resource Form Modal */}
                    {showAdmin && editingResource && editingResource.id === resource.id && (
                      <div className="edit-resource-overlay" onClick={() => setEditingResource(null)}>
                        <div className="edit-resource-modal" onClick={(e) => e.stopPropagation()}>
                          <h4>Edit Resource</h4>
                          <form onSubmit={handleUpdateResource}>
                            <div className="form-row">
                              <select
                                value={editingResource.deckId || ''}
                                onChange={(e) => setEditingResource({ ...editingResource, deckId: e.target.value ? parseInt(e.target.value) : null })}
                              >
                                <option value="">
                                  {editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion'
                                    ? 'No Deck (Optional)'
                                    : 'Select Deck'}
                                </option>
                                {decks.map(deck => (
                                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                                ))}
                              </select>
                            </div>
                            {(editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion') && (
                              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                Note: Deck selection is optional for {editingResource.type} resources.
                              </div>
                            )}
                            <div className="form-row">
                              <select
                                value={editingResource.type}
                                onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value })}
                                required
                              >
                                <option value="Guide">Guide</option>
                                <option value="Gameplay">Gameplay</option>
                                <option value="Guide and Gameplay">Guide and Gameplay</option>
                                <option value="Discussion">Discussion</option>
                                <option value="Tournament Report">Tournament Report</option>
                                <option value="Tierlist">Tierlist</option>
                                <option value="Metagame Discussion">Metagame Discussion</option>
                              </select>
                              <select
                                value={editingResource.platform}
                                onChange={(e) => setEditingResource({ ...editingResource, platform: e.target.value })}
                                required
                              >
                                <option value="YouTube">YouTube</option>
                                <option value="Metafy">Metafy</option>
                                <option value="Reddit">Reddit</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <input
                                type="url"
                                placeholder="URL *"
                                value={editingResource.url}
                                onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                                required
                              />
                            </div>
                            <div className="form-row">
                              <input
                                type="text"
                                placeholder="Title *"
                                value={editingResource.title}
                                onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                                required
                              />
                              <input
                                type="text"
                                placeholder="Author"
                                value={editingResource.author}
                                onChange={(e) => setEditingResource({ ...editingResource, author: e.target.value })}
                              />
                            </div>
                            <div className="form-row">
                              <select
                                value={editingResource.accessType}
                                onChange={(e) => setEditingResource({ ...editingResource, accessType: e.target.value })}
                                required
                              >
                                <option value="Free">Free</option>
                                <option value="Paid">Paid</option>
                              </select>
                              <input
                                type="date"
                                placeholder="Publication Date"
                                value={editingResource.publicationDate}
                                onChange={(e) => setEditingResource({ ...editingResource, publicationDate: e.target.value })}
                              />
                            </div>
                            <input
                              type="url"
                              placeholder="Thumbnail URL"
                              value={editingResource.thumbnail}
                              onChange={(e) => setEditingResource({ ...editingResource, thumbnail: e.target.value })}
                              style={{ width: '100%', marginTop: '0.5rem' }}
                            />
                            <textarea
                              placeholder="Decklist (optional)"
                              value={editingResource.decklist}
                              onChange={(e) => setEditingResource({ ...editingResource, decklist: e.target.value })}
                              rows="8"
                              style={{ fontFamily: 'monospace', fontSize: '0.9rem', width: '100%', marginTop: '0.5rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                              <button type="submit" className="btn btn-primary">Save Changes</button>
                              {editingResource.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={() => handleApproveResource(editingResource.id)}
                                  style={{ backgroundColor: '#28a745', color: 'white' }}
                                >
                                  Approve & Save
                                </button>
                              )}
                              <button type="button" onClick={() => setEditingResource(null)} className="btn btn-secondary">Cancel</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Edit Chapter Modal */}
        {editingChapter && (
          <div className="edit-resource-overlay" onClick={() => setEditingChapter(null)}>
            <div className="edit-resource-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', minHeight: '400px' }}>
              <h4>Edit Chapter</h4>
              <form onSubmit={handleUpdateChapter}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Timestamp (e.g., 1:23)"
                    value={editingChapter.timestamp || ''}
                    onChange={(e) => setEditingChapter({ ...editingChapter, timestamp: e.target.value })}
                    required
                    style={{ flex: '0 0 120px' }}
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={editingChapter.title || ''}
                    onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
                <div className="form-row" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search for opponent deck (optional)"
                    value={editChapterDeckSearch}
                    onChange={(e) => {
                      setEditChapterDeckSearch(e.target.value);
                      setShowEditChapterDeckDropdown(true);
                    }}
                    onFocus={() => setShowEditChapterDeckDropdown(true)}
                    style={{ width: '100%' }}
                  />
                  {showEditChapterDeckDropdown && editChapterDeckSearch && (
                    <div className="deck-search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
                      {decks
                        .filter(deck => deck.name.toLowerCase().includes(editChapterDeckSearch.toLowerCase()))
                        .slice(0, 10)
                        .map(deck => (
                          <div
                            key={deck.id}
                            className="deck-search-item"
                            onClick={() => {
                              setEditingChapter({ ...editingChapter, opposingDeckId: deck.id, opposingDeck: deck });
                              setEditChapterDeckSearch(deck.name);
                              setShowEditChapterDeckDropdown(false);
                            }}
                          >
                            {deck.name}
                          </div>
                        ))}
                      {decks.filter(deck => deck.name.toLowerCase().includes(editChapterDeckSearch.toLowerCase())).length === 0 && (
                        <div className="deck-search-item" style={{ color: '#999' }}>No decks found</div>
                      )}
                    </div>
                  )}
                  {editingChapter.opposingDeck && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      Selected: <strong>{editingChapter.opposingDeck.name}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChapter({ ...editingChapter, opposingDeckId: null, opposingDeck: null });
                          setEditChapterDeckSearch('');
                        }}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        className="btn btn-secondary"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" onClick={() => setEditingChapter(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Deck Modal */}
        {editingDeck && (
          <div className="edit-resource-overlay" onClick={() => setEditingDeck(null)}>
            <div className="edit-resource-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Edit Deck</h4>
              <form onSubmit={handleUpdateDeck}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Deck Name *"
                    value={editingDeck.name}
                    onChange={(e) => setEditingDeck({ ...editingDeck, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  You can either paste an image URL or upload an image file from your computer.
                </div>
                <div className="form-row">
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      placeholder="Icon 1 URL (optional)"
                      value={editingDeck.icon1}
                      onChange={(e) => setEditingDeck({ ...editingDeck, icon1: e.target.value })}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label
                        htmlFor="icon1-upload"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'inline-block'
                        }}
                      >
                        📁 Upload Icon 1
                      </label>
                      <input
                        id="icon1-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingDeck({ ...editingDeck, icon1: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      placeholder="Icon 2 URL (optional)"
                      value={editingDeck.icon2}
                      onChange={(e) => setEditingDeck({ ...editingDeck, icon2: e.target.value })}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label
                        htmlFor="icon2-upload"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'inline-block'
                        }}
                      >
                        📁 Upload Icon 2
                      </label>
                      <input
                        id="icon2-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingDeck({ ...editingDeck, icon2: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                {(editingDeck.icon1 || editingDeck.icon2) && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Preview:</strong>
                    {editingDeck.icon1 && (
                      <img src={editingDeck.icon1} alt="Icon 1" style={{ width: '32px', height: '32px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                    )}
                    {editingDeck.icon2 && (
                      <img src={editingDeck.icon2} alt="Icon 2" style={{ width: '32px', height: '32px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" onClick={() => setEditingDeck(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Admin Panel
  if (currentView === 'admin') {
    return (
      <div className="App">
        <header className="header">
          <button onClick={() => setCurrentView('home')} className="back-btn">
            ← Back to Home
          </button>
          <h1>🎴 PokeVods - Admin Panel</h1>
        </header>

        <div className="deck-detail" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Admin Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #ddd' }}>
            <button
              onClick={() => {
                setAdminTab('bulkImport');
                setImportResults(null);
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'bulkImport' ? '#007bff' : 'transparent',
                color: adminTab === 'bulkImport' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'bulkImport' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              📥 Bulk Import
            </button>
            <button
              onClick={() => {
                setAdminTab('reviewQueue');
                fetchPendingResources();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'reviewQueue' ? '#007bff' : 'transparent',
                color: adminTab === 'reviewQueue' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'reviewQueue' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              📋 Review Queue {pendingResources.length > 0 && `(${pendingResources.length})`}
            </button>
            <button
              onClick={() => {
                setAdminTab('matchupQueue');
                fetchMatchupResources();
              }}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: adminTab === 'matchupQueue' ? '#007bff' : 'transparent',
                color: adminTab === 'matchupQueue' ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: adminTab === 'matchupQueue' ? '3px solid #007bff' : 'none',
                marginBottom: '-2px'
              }}
            >
              🎯 Matchup Queue {matchupResources.length > 0 && `(${matchupResources.length})`}
            </button>
          </div>

          {/* Bulk Import Tab */}
          {adminTab === 'bulkImport' && (
            <div>
              {/* Single Video Section */}
              <div style={{ marginBottom: '3rem', padding: '1.5rem', border: '2px solid #007bff', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                <h2 style={{ marginTop: 0 }}>Add Single Video</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Manually add a single YouTube video to a specific deck.
                </p>

                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Deck *</label>
                  <input
                    type="text"
                    placeholder="Search for deck..."
                    value={singleVideoDeckSearch}
                    onChange={(e) => {
                      setSingleVideoDeckSearch(e.target.value);
                      setShowSingleVideoDeckDropdown(true);
                    }}
                    onFocus={() => setShowSingleVideoDeckDropdown(true)}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                  />
                  {showSingleVideoDeckDropdown && singleVideoDeckSearch && (
                    <div className="deck-search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
                      {decks
                        .filter(deck => deck.name.toLowerCase().includes(singleVideoDeckSearch.toLowerCase()))
                        .slice(0, 10)
                        .map(deck => {
                          const icons = deck.icons ? JSON.parse(deck.icons) : [];
                          return (
                            <div
                              key={deck.id}
                              className="deck-search-item"
                              onClick={() => {
                                setSelectedSingleVideoDeck(deck);
                                setSingleVideoDeckSearch(deck.name);
                                setShowSingleVideoDeckDropdown(false);
                              }}
                            >
                              <div className="deck-icons-group">
                                {icons.length > 0 ? (
                                  icons.slice(0, 2).map((iconPath, idx) => (
                                    <img key={idx} src={iconPath} alt="" className="deck-search-icon" />
                                  ))
                                ) : (
                                  <div className="deck-search-icon-placeholder">?</div>
                                )}
                              </div>
                              <span>{deck.name}</span>
                            </div>
                          );
                        })}
                      {decks.filter(deck => deck.name.toLowerCase().includes(singleVideoDeckSearch.toLowerCase())).length === 0 && (
                        <div className="deck-search-item" style={{ color: '#999' }}>No decks found</div>
                      )}
                    </div>
                  )}
                  {selectedSingleVideoDeck && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      Selected: <strong>{selectedSingleVideoDeck.name}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSingleVideoDeck(null);
                          setSingleVideoDeckSearch('');
                        }}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        className="btn btn-secondary"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>YouTube URL *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                      style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newResource.url) {
                          alert('Please enter a YouTube URL first');
                          return;
                        }
                        setFetchingYouTube(true);
                        try {
                          const response = await fetch('/api/youtube', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: newResource.url })
                          });
                          const data = await response.json();
                          if (response.ok) {
                            // Auto-detect Tierlist type if "tier list" is in the title
                            const isTierlist = (data.title || '').toLowerCase().includes('tier list');
                            setNewResource({
                              ...newResource,
                              title: data.title || '',
                              author: data.author || '',
                              thumbnail: data.thumbnail || '',
                              publicationDate: data.publishedAt ? data.publishedAt.split('T')[0] : '',
                              type: isTierlist ? 'Tierlist' : newResource.type
                            });
                            setParsedChapters(data.chapters || []);
                          } else {
                            alert(`Error: ${data.error}`);
                          }
                        } catch (error) {
                          alert('Failed to fetch YouTube data');
                        } finally {
                          setFetchingYouTube(false);
                        }
                      }}
                      className="btn btn-secondary"
                      disabled={fetchingYouTube || !newResource.url}
                      style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
                    >
                      {fetchingYouTube ? 'Fetching...' : '🔄 Fetch Info'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title *</label>
                    <input
                      type="text"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Author</label>
                    <input
                      type="text"
                      value={newResource.author}
                      onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '2px solid #ddd' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!selectedSingleVideoDeck) {
                      alert('Please select a deck first');
                      return;
                    }
                    if (!newResource.url || !newResource.title) {
                      alert('Please fill in URL and Title');
                      return;
                    }

                    try {
                      const response = await fetch('/api/resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...newResource,
                          deckId: selectedSingleVideoDeck.id
                        })
                      });

                      if (response.ok) {
                        const createdResource = await response.json();

                        // Add chapters if we have them
                        if (parsedChapters.length > 0) {
                          for (const chapter of parsedChapters) {
                            await fetch('/api/chapters', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                resourceId: createdResource.id,
                                timestamp: chapter.timestamp,
                                title: chapter.title,
                                chapterType: chapter.isMatchup ? 'Matchup' : 'Guide',
                                opposingDeckId: null
                              })
                            });
                          }
                        }

                        alert('Video added successfully!');
                        // Reset form
                        setNewResource({
                          type: 'Guide',
                          title: '',
                          url: '',
                          author: '',
                          platform: 'YouTube',
                          accessType: 'Free',
                          publicationDate: '',
                          thumbnail: '',
                          decklist: ''
                        });
                        setSelectedSingleVideoDeck(null);
                        setSingleVideoDeckSearch('');
                        setParsedChapters([]);
                      } else {
                        const error = await response.json();
                        alert(`Error: ${error.error}`);
                      }
                    } catch (error) {
                      alert('Failed to add video');
                    }
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
                >
                  ➕ Add Video
                </button>
              </div>

              <h2>Bulk Import YouTube Videos</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Import videos from a YouTube channel, playlist, or paste individual URLs. The system will automatically detect which deck each video belongs to based on the title.
          </p>

          <form onSubmit={handleBulkImport} style={{ marginBottom: '2rem' }}>
            <textarea
              placeholder="Enter a YouTube channel URL, playlist URL, or paste multiple video URLs (one per line)&#10;&#10;Examples:&#10;https://www.youtube.com/@ChannelName/videos&#10;https://www.youtube.com/playlist?list=...&#10;https://www.youtube.com/watch?v=..."
              value={bulkImportSource}
              onChange={(e) => setBulkImportSource(e.target.value)}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
              disabled={bulkImporting}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '1rem', fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
              disabled={bulkImporting}
            >
              {bulkImporting ? 'Importing...' : '📥 Start Import'}
            </button>
          </form>

          {importResults && (
            <div style={{ marginTop: '2rem', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
              <h3>Import Results</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#d4edda', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                    {importResults.results.filter(r => r.success && r.status === 'approved').length}
                  </div>
                  <div style={{ color: '#155724' }}>Approved</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
                    {importResults.results.filter(r => r.success && r.status === 'pending').length}
                  </div>
                  <div style={{ color: '#856404' }}>Pending Review</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>
                    {importResults.results.filter(r => !r.success && r.needsManualDeck).length}
                  </div>
                  <div style={{ color: '#721c24' }}>No Deck Detected</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>
                    {importResults.results.filter(r => !r.success && !r.needsManualDeck).length}
                  </div>
                  <div style={{ color: '#721c24' }}>Failed</div>
                </div>
              </div>

              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {importResults.results.map((result, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', marginBottom: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{result.title || result.url}</div>
                    <div style={{ color: '#666' }}>
                      {result.success ? (
                        <>
                          ✅ Imported - Status: {result.status} | Detection: {result.deckDetectionMethod}
                        </>
                      ) : (
                        <>
                          ❌ {result.error}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
          )}

          {/* Review Queue Tab */}
          {adminTab === 'reviewQueue' && (
            <div>
              <h2>Review Queue ({pendingResources.length})</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                These resources need review before being published. They may be missing deck assignment, chapters, or decklists.
              </p>

              {pendingResources.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No pending resources to review!</p>
              ) : (
                pendingResources.map(resource => (
                  <div key={resource.id} style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {resource.deck?.name ? (
                          <span style={{ color: '#28a745' }}>✓ {resource.deck.name}</span>
                        ) : (
                          <span style={{ color: '#dc3545' }}>⚠ No Deck Assigned</span>
                        )}
                        {' '}- {resource.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        <strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        <strong>Status:</strong> Chapters: {resource.chapters?.length || 0} | Decklist: {resource.decklist ? 'Yes' : 'No'} | Author: {resource.author || 'Unknown'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingResource(resource);
                          setEditDeckSearch(resource.deck?.name || '');
                          setShowEditDeckDropdown(false);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApproveResource(resource.id, resource)}
                        style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          if (window.confirm('Delete this resource permanently?')) {
                            handleDeleteResource(resource.id);
                            fetchPendingResources();
                          }
                        }}
                        style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Matchup Queue Tab */}
          {adminTab === 'matchupQueue' && (
            <div>
              <h2>Matchup Queue ({matchupResources.length})</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Resources that need matchup information. This includes:
                <br />• Videos with matchup chapters missing opponent deck assignments
                <br />• Gameplay videos with no matchup chapters at all
              </p>

              {matchupResources.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No matchups need review!</p>
              ) : (
                matchupResources.map(resource => {
                  const missingMatchups = resource.chapters?.filter(ch => ch.chapterType === 'Matchup' && !ch.opposingDeckId) || [];
                  const hasMatchupChapters = resource.chapters?.some(ch => ch.chapterType === 'Matchup') || false;
                  const isGameplayWithNoMatchups = resource.type.includes('Gameplay') && !hasMatchupChapters;

                  return (
                    <div key={resource.id} style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: isGameplayWithNoMatchups ? '#fff8dc' : '#fff3cd' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {resource.deck?.name && <span style={{ color: '#28a745' }}>{resource.deck.name}</span>}
                          {' '}- {resource.title}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          <strong>Type:</strong> {resource.type} | <strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
                        </div>
                        {isGameplayWithNoMatchups ? (
                          <div style={{ fontSize: '0.9rem', color: '#cc7a00', marginBottom: '0.5rem' }}>
                            <strong>⚠ Gameplay video with no matchup chapters</strong>
                            <br />
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>
                              This video is marked as "Gameplay" but has no matchup chapters. Add matchup chapters to organize the gameplay by opponent deck.
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.9rem', color: '#856404', marginBottom: '0.5rem' }}>
                            <strong>⚠ {missingMatchups.length} Matchup(s) Missing Opponent Deck:</strong>
                            {missingMatchups.map((ch, idx) => (
                              <span key={ch.id}>
                                {idx > 0 && ', '}
                                {ch.timestamp} - {ch.title || 'Untitled'}
                              </span>
                            ))}
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
                          {isGameplayWithNoMatchups ? '➕ Add Matchup Chapters' : '✏️ Edit & Assign Matchups'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Edit Resource Modal (can be opened from review queue) */}
        {editingResource && (
          <div className="edit-resource-overlay" onClick={() => setEditingResource(null)}>
            <div className="edit-resource-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Edit Resource</h4>
              <form onSubmit={handleUpdateResource}>
                <div className="form-row">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder={editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion' ? 'Search deck (optional)' : 'Search deck *'}
                      value={editDeckSearch}
                      onChange={(e) => {
                        setEditDeckSearch(e.target.value);
                        setShowEditDeckDropdown(true);
                      }}
                      onFocus={() => setShowEditDeckDropdown(true)}
                      style={{ width: '100%' }}
                    />
                    {showEditDeckDropdown && editDeckSearch && (
                      <div className="deck-search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
                        {decks
                          .filter(deck => deck.name.toLowerCase().includes(editDeckSearch.toLowerCase()))
                          .slice(0, 10)
                          .map(deck => {
                            const icons = deck.icons ? JSON.parse(deck.icons) : [];
                            return (
                              <div
                                key={deck.id}
                                className="deck-search-item"
                                onClick={() => {
                                  setEditingResource({ ...editingResource, deckId: deck.id });
                                  setEditDeckSearch(deck.name);
                                  setShowEditDeckDropdown(false);
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {icons.map((icon, i) => (
                                    <img key={i} src={icon} alt="" style={{ width: '24px', height: '24px' }} />
                                  ))}
                                  <span>{deck.name}</span>
                                </div>
                              </div>
                            );
                          })}
                        {decks.filter(deck => deck.name.toLowerCase().includes(editDeckSearch.toLowerCase())).length === 0 && (
                          <div className="deck-search-item" style={{ color: '#999' }}>No decks found</div>
                        )}
                      </div>
                    )}
                    {editingResource.deckId && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666' }}>
                        Selected: <strong>{decks.find(d => d.id === editingResource.deckId)?.name}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResource({ ...editingResource, deckId: null });
                            setEditDeckSearch('');
                          }}
                          style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <select
                    value={editingResource.type}
                    onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value })}
                    required
                  >
                    <option value="Guide">Guide</option>
                    <option value="Gameplay">Gameplay</option>
                    <option value="Guide and Gameplay">Guide and Gameplay</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Tournament Report">Tournament Report</option>
                    <option value="Tierlist">Tierlist</option>
                    <option value="Metagame Discussion">Metagame Discussion</option>
                  </select>
                </div>
                {(editingResource.type === 'Tierlist' || editingResource.type === 'Metagame Discussion') && (
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    Note: Deck selection is optional for {editingResource.type} resources.
                  </div>
                )}
                <div className="form-row">
                  <input
                    type="url"
                    placeholder="URL *"
                    value={editingResource.url}
                    onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Title *"
                    value={editingResource.title}
                    onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={editingResource.author || ''}
                    onChange={(e) => setEditingResource({ ...editingResource, author: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Decklist (optional)"
                  value={editingResource.decklist || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, decklist: e.target.value })}
                  rows="8"
                  style={{ fontFamily: 'monospace', fontSize: '0.9rem', width: '100%', marginTop: '0.5rem' }}
                />

                {/* Chapters Section */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ margin: 0 }}>Chapters ({editingResource.chapters?.length || 0})</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        const newChapter = { title: '', timestamp: '', opponentDeck: '' };
                        setEditingResource({
                          ...editingResource,
                          chapters: [...(editingResource.chapters || []), newChapter]
                        });
                      }}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                    >
                      + Add Chapter
                    </button>
                  </div>

                  {editingResource.chapters && editingResource.chapters.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                      {editingResource.chapters.map((chapter, index) => (
                        <div key={index} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Timestamp (e.g., 1:23)"
                              value={chapter.timestamp || ''}
                              onChange={(e) => {
                                const updatedChapters = [...editingResource.chapters];
                                updatedChapters[index] = { ...updatedChapters[index], timestamp: e.target.value };
                                setEditingResource({ ...editingResource, chapters: updatedChapters });
                              }}
                              style={{ flex: '0 0 120px', padding: '0.5rem', fontSize: '0.9rem' }}
                            />
                            <input
                              type="text"
                              placeholder="Title"
                              value={chapter.title || ''}
                              onChange={(e) => {
                                const updatedChapters = [...editingResource.chapters];
                                updatedChapters[index] = { ...updatedChapters[index], title: e.target.value };
                                setEditingResource({ ...editingResource, chapters: updatedChapters });
                              }}
                              style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedChapters = editingResource.chapters.filter((_, i) => i !== index);
                                setEditingResource({ ...editingResource, chapters: updatedChapters });
                              }}
                              style={{ padding: '0.5rem 0.75rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              ✗
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Opponent Deck (optional)"
                            value={chapter.opponentDeck || ''}
                            onChange={(e) => {
                              const updatedChapters = [...editingResource.chapters];
                              updatedChapters[index] = { ...updatedChapters[index], opponentDeck: e.target.value };
                              setEditingResource({ ...editingResource, chapters: updatedChapters });
                            }}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', margin: '1rem 0' }}>No chapters yet. Click "Add Chapter" to create one.</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  {editingResource.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleApproveResource(editingResource.id)}
                      style={{ backgroundColor: '#28a745', color: 'white' }}
                    >
                      Approve & Save
                    </button>
                  )}
                  <button type="button" onClick={() => setEditingResource(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div style={{ textAlign: 'left' }}>
          <h1>🎴 PokeVods</h1>
          <p className="subtitle">Pokemon TCG Deck Resources</p>
        </div>
      </header>

      {/* Admin Toolbar */}
      <div style={{
        background: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        padding: '0.75rem 2rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="btn btn-admin"
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          {showAdmin ? '🔒 Admin' : '🔓 Admin'}
        </button>
        {showAdmin && (
          <>
            <button
              onClick={() => {
                setCurrentView('admin');
                setAdminTab('bulkImport');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              ⚙️ Admin Panel
            </button>
            <button
              onClick={() => {
                fetchPendingResources();
                setCurrentView('admin');
                setAdminTab('reviewQueue');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              📋 Review Queue {pendingResources.length > 0 && `(${pendingResources.length})`}
            </button>
            <button
              onClick={() => {
                fetchMatchupResources();
                setCurrentView('admin');
                setAdminTab('matchupQueue');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              🎯 Matchup Queue {matchupResources.length > 0 && `(${matchupResources.length})`}
            </button>
          </>
        )}
      </div>

      <div className="search-section">
        <div className="search-bar-fullwidth">
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search decks by name, archetype, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              style={{ width: '100%' }}
            />
            {showSearchDropdown && searchQuery && (
              <div className="main-search-dropdown deck-search-dropdown">
                {decks
                  .filter(deck =>
                    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    deck.archetype?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 10)
                  .map(deck => {
                    const icons = deck.icons ? JSON.parse(deck.icons) : (deck.icon ? [deck.icon] : []);
                    return (
                      <div
                        key={deck.id}
                        className="deck-search-item"
                        onClick={() => {
                          fetchDeckById(deck.id);
                          setSearchQuery('');
                          setShowSearchDropdown(false);
                        }}
                      >
                        <div className="deck-icons-group">
                          {icons.length > 0 ? (
                            icons.slice(0, 2).map((iconPath, idx) => (
                              <img key={idx} src={iconPath} alt="" className="deck-search-icon" />
                            ))
                          ) : (
                            <div className="deck-search-icon-placeholder">?</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span style={{ fontWeight: '500' }}>{deck.name}</span>
                          <span style={{ fontSize: '0.85rem', color: '#666' }}>
                            {deck.resources?.length || 0} resources
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {decks.filter(deck =>
                  deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  deck.archetype?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No decks found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {showAdmin && (
          <button
            onClick={() => setShowAddDeck(!showAddDeck)}
            className="btn btn-success"
          >
            {showAddDeck ? 'Cancel' : '+ Add Deck'}
          </button>
        )}
      </div>

      {showAddDeck && (
        <div className="add-deck-section">
          <h3>Add New Deck</h3>
          <form onSubmit={handleAddDeck}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Deck Name *"
                value={newDeck.name}
                onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Archetype (e.g., Charizard ex) *"
                value={newDeck.archetype}
                onChange={(e) => setNewDeck({ ...newDeck, archetype: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <select
                value={newDeck.format}
                onChange={(e) => setNewDeck({ ...newDeck, format: e.target.value })}
                required
              >
                <option value="Standard">Standard</option>
                <option value="Expanded">Expanded</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>
            <div className="form-row">
              <input
                type="url"
                placeholder="Icon 1 URL (optional)"
                value={newDeck.icon1}
                onChange={(e) => setNewDeck({ ...newDeck, icon1: e.target.value })}
              />
              <input
                type="url"
                placeholder="Icon 2 URL (optional)"
                value={newDeck.icon2}
                onChange={(e) => setNewDeck({ ...newDeck, icon2: e.target.value })}
              />
            </div>
            {(newDeck.icon1 || newDeck.icon2) && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Preview:</strong>
                {newDeck.icon1 && (
                  <img src={newDeck.icon1} alt="Icon 1" style={{ width: '32px', height: '32px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                )}
                {newDeck.icon2 && (
                  <img src={newDeck.icon2} alt="Icon 2" style={{ width: '32px', height: '32px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>
            )}
            <textarea
              placeholder="Description (optional)"
              value={newDeck.description}
              onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
              rows="3"
            />
            <textarea
              placeholder="Deck List (optional)"
              value={newDeck.deckList}
              onChange={(e) => setNewDeck({ ...newDeck, deckList: e.target.value })}
              rows="8"
            />
            <button type="submit" className="btn btn-primary">Create Deck</button>
          </form>
        </div>
      )}

      {/* Tier Lists Section */}
      {tierListResources.length > 0 && (
        <div className="decks-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>📊 Tier Lists</h2>
          <div className="decks-list">
            {tierListResources.map(resource => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="deck-list-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="deck-list-info">
                  <span className="deck-list-name">{resource.title}</span>
                  <span className="deck-list-meta">
                    {resource.authorProfile?.name || resource.author}
                    {resource.publicationDate && ` • ${new Date(resource.publicationDate).toLocaleDateString()}`}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tournament VODs Section */}
      {tournamentResources.length > 0 && (
        <div className="decks-container" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>🏆 Tournament VODs</h2>
          <div className="decks-list">
            {tournamentResources.map(resource => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="deck-list-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="deck-list-info">
                  <span className="deck-list-name">
                    {resource.deck?.name && (
                      <span style={{ color: '#28a745', fontWeight: 'bold', marginRight: '0.5rem' }}>
                        {resource.deck.name}
                      </span>
                    )}
                    {resource.title}
                  </span>
                  <span className="deck-list-meta">
                    {resource.authorProfile?.name || resource.author}
                    {resource.publicationDate && ` • ${new Date(resource.publicationDate).toLocaleDateString()}`}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="decks-container">
        <h2 style={{ marginBottom: '1rem' }}>Deck Guides</h2>
        {loading ? (
          <div className="loading">Loading decks...</div>
        ) : decks.length === 0 ? (
          <div className="no-results">
            <p>No decks found. Add your first deck!</p>
          </div>
        ) : (
          <div className="decks-list">
            {getSortedDecks()
              .filter(deck => showAdmin || (deck.resources && deck.resources.length > 0))
              .map(deck => {
              const icons = deck.icons ? JSON.parse(deck.icons) : (deck.icon ? [deck.icon] : []);
              return (
                <div
                  key={deck.id}
                  className="deck-list-item"
                  onClick={() => fetchDeckById(deck.id)}
                >
                  <div className="deck-icons-group">
                    {icons.length > 0 ? (
                      icons.map((iconPath, idx) => (
                        <img key={idx} src={iconPath} alt="" className="deck-list-icon" />
                      ))
                    ) : (
                      <div className="deck-list-icon-placeholder">?</div>
                    )}
                  </div>
                  <div className="deck-list-info">
                    <span className="deck-list-name">{deck.name}</span>
                    <span className="deck-list-meta">
                      {deck.resources?.length || 0} resources
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Premium Guides Section (only guides without deck assignment) */}
        {paidGuides.filter(guide => !guide.deckId).length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>💎 Premium Guides</h2>
            <div className="decks-list">
              {paidGuides.filter(guide => !guide.deckId).map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="deck-list-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="deck-list-info">
                    <span className="deck-list-name">
                      {resource.title}
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.7rem',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: 'normal'
                      }}>PAID</span>
                    </span>
                    <span className="deck-list-meta">
                      {resource.platform} • {resource.authorProfile?.name || resource.author}
                      {resource.publicationDate && ` • ${new Date(resource.publicationDate).toLocaleDateString()}`}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Review Queue Overlay */}
        {showReviewQueue && (
          <div className="edit-resource-overlay" onClick={() => setShowReviewQueue(false)}>
            <div className="edit-resource-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2>Review Queue ({pendingResources.length})</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>These resources are missing chapters or decklists and need review before being published.</p>

              {pendingResources.length === 0 ? (
                <p>No pending resources to review!</p>
              ) : (
                pendingResources.map(resource => (
                  <div key={resource.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>{resource.deck?.name}</strong> - {resource.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      URL: <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      Chapters: {resource.chapters?.length || 0} | Has Decklist: {resource.decklist ? 'Yes' : 'No'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingResource(resource);
                          setEditDeckSearch(resource.deck?.name || '');
                          setShowEditDeckDropdown(false);
                          setShowReviewQueue(false);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApproveResource(resource.id, resource)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}

              <button
                className="btn btn-secondary"
                onClick={() => setShowReviewQueue(false)}
                style={{ marginTop: '1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
