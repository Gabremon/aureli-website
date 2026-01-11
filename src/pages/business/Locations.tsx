import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';
import './Locations.css';

interface Location {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationGroup {
  state: string;
  locations: Location[];
}

export default function Locations() {
  const { token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    is_active: true,
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      setError('Location name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/locations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create location');
      }

      // Refresh locations list
      await fetchLocations();
      
      // Reset form and close modal
      setNewLocation({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        is_active: true,
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create location');
      console.error('Error creating location:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group locations by state (or country if no state)
  const groupLocationsByState = (): LocationGroup[] => {
    const grouped: { [key: string]: Location[] } = {};
    
    locations.forEach(location => {
      const groupKey = location.state || location.country || 'Other';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(location);
    });

    return Object.entries(grouped)
      .map(([state, locs]) => ({ state, locations: locs }))
      .sort((a, b) => a.state.localeCompare(b.state));
  };

  // Filter location groups based on search query
  const filteredLocationGroups = (): LocationGroup[] => {
    const groups = groupLocationsByState();
    if (!searchQuery.trim()) {
      return groups;
    }

    const query = searchQuery.toLowerCase();
    return groups.filter(group => {
      const groupMatches = group.state.toLowerCase().includes(query);
      const locationMatches = group.locations.some(loc => 
        loc.name.toLowerCase().includes(query) ||
        loc.city?.toLowerCase().includes(query) ||
        loc.address?.toLowerCase().includes(query)
      );
      return groupMatches || locationMatches;
    });
  };

  const toggleGroup = (state: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(state)) {
      newExpanded.delete(state);
    } else {
      newExpanded.add(state);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="locations-container">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading locations...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const locationGroups = filteredLocationGroups();

  return (
    <div className="dashboard-page business-dashboard">
      <BusinessHeader />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="locations-container">
            <div className="locations-page-header">
              <h1 className="locations-page-title">Locations</h1>
              <div className="locations-header-actions">
                {locations.length === 0 ? (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="button-primary add-first-location-button"
                  >
                    Add your first location
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                    className="map-view-button"
                  >
                    Switch to Map View
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {viewMode === 'list' ? (
              <>
                {locations.length === 0 ? (
                  <div className="no-locations-container">
                    <div className="empty-state">
                      <div className="empty-state-icon">📍</div>
                      <h2>No Locations Yet</h2>
                      <p>Get started by adding your first location using the button above.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="location-groups-section">
                      <h2 className="location-groups-title">
                        Location Groups ({locationGroups.length})
                      </h2>
                      <div className="location-groups-search">
                        <input
                          type="text"
                          placeholder="Search Location Groups"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                      </div>
                    </div>

                    {locationGroups.length === 0 ? (
                      <div className="no-groups-message">
                        <p>No location groups found matching your search.</p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="button-secondary"
                            style={{ marginTop: '0.5rem' }}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="location-groups-list">
                        {locationGroups.map((group) => {
                          const isExpanded = expandedGroups.has(group.state);
                          
                          return (
                            <div key={group.state} className="location-group-card">
                              <div
                                className="location-group-header"
                                onClick={() => toggleGroup(group.state)}
                              >
                                <span className="location-group-name">{group.state}</span>
                                <div className="location-group-right">
                                  <span className="location-group-count">
                                    {group.locations.length} {group.locations.length === 1 ? 'location' : 'locations'}
                                  </span>
                                  <span className={`location-group-arrow ${isExpanded ? 'expanded' : ''}`}>
                                    →
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="location-group-content">
                                  {group.locations.map((location) => (
                                    <div key={location.id} className="location-item">
                                      <div className="location-item-main">
                                        <div className="location-item-info">
                                          <span className="location-item-name">{location.name}</span>
                                          {location.city && (
                                            <span className="location-item-city">{location.city}</span>
                                          )}
                                        </div>
                                        <span className={`location-item-badge ${location.is_active ? 'active' : 'inactive'}`}>
                                          {location.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                      {location.address && (
                                        <div className="location-item-details">
                                          <span className="location-detail">{location.address}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  <div className="location-group-actions">
                                    <button
                                      onClick={() => setShowAddModal(true)}
                                      className="add-location-inline-button"
                                    >
                                      + Add Location to {group.state}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="locations-actions-bar">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="button-primary add-location-button"
                      >
                        + Add Location
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="map-view-placeholder">
                <p>Map view coming soon!</p>
                <button
                  onClick={() => setViewMode('list')}
                  className="button-secondary"
                >
                  Switch to List View
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Location</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Location Name *</label>
                <input
                  id="name"
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="e.g., Main Office, Downtown Branch"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zip_code">ZIP Code</label>
                  <input
                    id="zip_code"
                    type="text"
                    value={newLocation.zip_code}
                    onChange={(e) => setNewLocation({ ...newLocation, zip_code: e.target.value })}
                    placeholder="ZIP"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  value={newLocation.country}
                  onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                  placeholder="Country"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newLocation.is_active}
                    onChange={(e) => setNewLocation({ ...newLocation, is_active: e.target.checked })}
                  />
                  <span>Active Location</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="button-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="button-primary"
                onClick={handleAddLocation}
                disabled={submitting || !newLocation.name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

