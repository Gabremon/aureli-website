import { useEffect, useState } from 'react';
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

export default function BusinessOwnerDashboard() {
  const { user, token } = useAuth();
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newOpening, setNewOpening] = useState({
    title: '',
    location_id: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchOpenings();
    fetchLocations();
  }, [token]);

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

  const handleAddOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOpening.title.trim()) {
      setError('Opening title is required');
      return;
    }

    if (!newOpening.location_id) {
      setError('Location is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/business/openings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newOpening.title.trim(),
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
        title: '',
        location_id: '',
      });
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
                      <tr key={opening.id}>
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
                      <label htmlFor="opening-title">
                        Opening Title <span className="required">*</span>
                      </label>
                      <input
                        id="opening-title"
                        type="text"
                        value={newOpening.title}
                        onChange={(e) => setNewOpening({ ...newOpening, title: e.target.value })}
                        placeholder="e.g., Software Engineer, Customer Service Representative"
                        required
                      />
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
                      onClick={() => setShowAddModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button-primary"
                      disabled={submitting || !newOpening.title.trim() || !newOpening.location_id}
                    >
                      {submitting ? 'Creating...' : 'Create Opening'}
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

