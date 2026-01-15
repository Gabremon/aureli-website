import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';
import './Dashboard.css';

interface Opening {
  id: number;
  business_id: number;
  location_id: number;
  title: string;
  position_type: string | null;
  created_at: string;
  updated_at: string;
  business_name: string;
  location_name: string;
  location_address: string | null;
  location_city: string | null;
  location_state: string | null;
  location_zip_code: string | null;
  location_country: string | null;
  application_count: number;
}

interface Location {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
}

interface Position {
  id: number;
  business_id: number;
  job_title: string;
  job_description: string | null;
  created_at: string;
  updated_at: string;
}

export default function BusinessOwnerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [positionSearchQuery, setPositionSearchQuery] = useState('');
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  const positionDropdownRef = useRef<HTMLDivElement>(null);

  const [newOpening, setNewOpening] = useState({
    position_id: '',
    location_id: '',
  });

  const [newPosition, setNewPosition] = useState({
    job_title: '',
    job_description: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchOpenings();
    fetchLocations();
    fetchPositions();
  }, [token]);

  // Close position dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target as Node)) {
        setPositionDropdownOpen(false);
      }
    };

    if (positionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [positionDropdownOpen]);

  const fetchOpenings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/openings`, {
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
        throw new Error(errorData.error || 'Failed to fetch openings');
      }

      const data = await response.json();
      setOpenings(data.openings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch openings');
      console.error('Error fetching openings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/business/positions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
    }
  };

  // Filter positions based on search query
  const filteredPositions = positions.filter(position => {
    const query = positionSearchQuery.toLowerCase();
    return position.job_title.toLowerCase().includes(query);
  });

  // Handle position selection
  const handlePositionSelect = (positionId: string) => {
    setNewOpening({ ...newOpening, position_id: positionId });
    const selectedPosition = positions.find(p => p.id.toString() === positionId);
    if (selectedPosition) {
      setPositionSearchQuery(selectedPosition.job_title);
    }
    setPositionDropdownOpen(false);
  };

  const handleCreatePosition = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPosition.job_title.trim()) {
      setError('Job title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/positions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: newPosition.job_title.trim(),
          job_description: newPosition.job_description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create position');
      }

      const data = await response.json();
      
      // Refresh positions list
      await fetchPositions();
      
      // Auto-select the newly created position
      setNewOpening({ ...newOpening, position_id: data.position.id.toString() });
      setPositionSearchQuery(data.position.job_title);
      
      // Reset position form and close modal
      setNewPosition({ job_title: '', job_description: '' });
      setShowPositionModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create position');
      console.error('Error creating position:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOpening = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newOpening.position_id) {
      setError('Please select or create a position before saving the opening');
      return;
    }

    if (!newOpening.location_id) {
      setError('Location is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Get the selected position to use its job_title as the opening title
      const selectedPosition = positions.find(p => p.id.toString() === newOpening.position_id);
      if (!selectedPosition) {
        throw new Error('Selected position not found');
      }

      const response = await fetch(`${API_URL}/api/business/openings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedPosition.job_title,
          location_id: parseInt(newOpening.location_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create opening');
      }

      // Refresh openings list
      await fetchOpenings();
      
      // Reset form and close modal
      setNewOpening({
        position_id: '',
        location_id: '',
      });
      setPositionSearchQuery('');
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create opening');
      console.error('Error creating opening:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddress = (opening: Opening): string => {
    const parts = [];
    if (opening.location_address) parts.push(opening.location_address);
    if (opening.location_city) parts.push(opening.location_city);
    if (opening.location_state) parts.push(opening.location_state);
    if (opening.location_zip_code) parts.push(opening.location_zip_code);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  if (loading) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="dashboard-loading">
              <p>Loading openings...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page business-dashboard">
      <BusinessHeader />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header" style={{ padding: '2rem 2rem 1rem 2rem', maxWidth: '100%' }}>
            <div>
              <h1 className="dashboard-title">Openings</h1>
              <p className="dashboard-subtitle">
                Manage job openings and track applications
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="button-primary"
            >
              + Add Opening
            </button>
          </div>

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          <div className="dashboard-content">
            {openings.length === 0 ? (
              <div className="empty-state">
                <p>No openings yet. Create your first opening to get started.</p>
              </div>
            ) : (
              <div className="openings-table-container">
                <table className="openings-table">
                  <thead>
                    <tr>
                      <th>Opening</th>
                      <th>Company Name</th>
                      <th>Location Group</th>
                      <th>Location & Address</th>
                      <th>Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openings.map((opening) => (
                      <tr 
                        key={opening.id}
                        className="opening-row"
                        onClick={() => navigate(`/business-owner/openings/${opening.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="opening-title">{opening.title}</td>
                        <td>{opening.business_name}</td>
                        <td>{opening.location_state || 'N/A'}</td>
                        <td>
                          <div className="location-info">
                            <div className="location-name">{opening.location_name}</div>
                            <div className="location-address">{formatAddress(opening)}</div>
                          </div>
                        </td>
                        <td className="application-count">{opening.application_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Opening Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content opening-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Add New Opening</h3>
                  <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                </div>
                <form onSubmit={handleAddOpening}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="opening-position">
                        Position <span className="required">*</span>
                      </label>
                      <div className="position-dropdown-container" ref={positionDropdownRef}>
                        <div className="position-input-wrapper">
                          <input
                            id="opening-position"
                            type="text"
                            value={positionSearchQuery}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPositionSearchQuery(value);
                              setPositionDropdownOpen(true);
                            }}
                            onFocus={() => setPositionDropdownOpen(true)}
                            placeholder="Type to search or select a position"
                            autoComplete="off"
                            required
                          />
                          <button
                            type="button"
                            className="add-position-button"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPositionModal(true);
                            }}
                            title="Create new position"
                          >
                            +
                          </button>
                        </div>
                        {positionDropdownOpen && (
                          <div className="position-dropdown">
                            {filteredPositions.length > 0 ? (
                              filteredPositions.map((position) => (
                                <div
                                  key={position.id}
                                  className={`position-dropdown-item ${
                                    newOpening.position_id === position.id.toString() ? 'selected' : ''
                                  }`}
                                  onClick={() => handlePositionSelect(position.id.toString())}
                                >
                                  <span className="position-title">{position.job_title}</span>
                                  {position.job_description && (
                                    <span className="position-description">{position.job_description.substring(0, 50)}...</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="position-dropdown-item no-results">
                                No positions found. Click + to create a new one.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="opening-location">
                        Location <span className="required">*</span>
                      </label>
                      <select
                        id="opening-location"
                        value={newOpening.location_id}
                        onChange={(e) => setNewOpening({ ...newOpening, location_id: e.target.value })}
                        required
                      >
                        <option value="">Select a location</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                            {location.city && location.state ? ` - ${location.city}, ${location.state}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setShowAddModal(false);
                        setPositionSearchQuery('');
                        setPositionDropdownOpen(false);
                        setNewOpening({ position_id: '', location_id: '' });
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button-primary"
                      disabled={submitting || !newOpening.position_id || !newOpening.location_id}
                    >
                      {submitting ? 'Creating...' : 'Create Opening'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Position Modal */}
          {showPositionModal && (
            <div className="modal-overlay" onClick={() => setShowPositionModal(false)}>
              <div className="modal-content opening-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Create New Position</h3>
                  <button className="modal-close" onClick={() => setShowPositionModal(false)}>×</button>
                </div>
                <form onSubmit={handleCreatePosition}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="position-job-title">
                        Job Title <span className="required">*</span>
                      </label>
                      <input
                        id="position-job-title"
                        type="text"
                        value={newPosition.job_title}
                        onChange={(e) => setNewPosition({ ...newPosition, job_title: e.target.value })}
                        placeholder="e.g., Software Engineer, Customer Service Representative"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="position-job-description">Job Description</label>
                      <textarea
                        id="position-job-description"
                        value={newPosition.job_description}
                        onChange={(e) => setNewPosition({ ...newPosition, job_description: e.target.value })}
                        placeholder="Enter job description..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setShowPositionModal(false);
                        setNewPosition({ job_title: '', job_description: '' });
                        setError(null);
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button-primary"
                      disabled={submitting || !newPosition.job_title.trim()}
                    >
                      {submitting ? 'Creating...' : 'Create Position'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

