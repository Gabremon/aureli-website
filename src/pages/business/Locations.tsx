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
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Locations() {
  const { user, token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    phone: '',
    email: '',
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

      const data = await response.json();
      
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
        phone: '',
        email: '',
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <div className="dashboard-page business-dashboard">
      <BusinessHeader />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="locations-container">
            <div className="locations-header">
              <div>
                <h1 className="dashboard-title">Locations</h1>
                <p className="dashboard-subtitle">
                  Manage your business locations
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="button-primary add-location-button"
              >
                + Add Location
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {locations.length === 0 ? (
              <div className="no-locations-container">
                <div className="empty-state">
                  <div className="empty-state-icon">📍</div>
                  <h2>No Locations Yet</h2>
                  <p>Get started by adding your first location.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="button-primary"
                  >
                    + Add Your First Location
                  </button>
                </div>
              </div>
            ) : (
              <div className="locations-grid">
                {locations.map((location) => (
                  <div key={location.id} className="location-card">
                    <div className="location-card-header">
                      <h3 className="location-name">{location.name}</h3>
                      <span className={`location-badge ${location.is_active ? 'active' : 'inactive'}`}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="location-card-body">
                      {location.address && (
                        <p className="location-info">
                          <strong>Address:</strong> {location.address}
                        </p>
                      )}
                      {(location.city || location.state || location.zip_code) && (
                        <p className="location-info">
                          {[location.city, location.state, location.zip_code].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {location.country && (
                        <p className="location-info">
                          <strong>Country:</strong> {location.country}
                        </p>
                      )}
                      {location.phone && (
                        <p className="location-info">
                          <strong>Phone:</strong> {location.phone}
                        </p>
                      )}
                      {location.email && (
                        <p className="location-info">
                          <strong>Email:</strong> {location.email}
                        </p>
                      )}
                    </div>
                    <div className="location-card-footer">
                      <span className="location-date">
                        Created: {formatDate(location.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={newLocation.phone}
                    onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={newLocation.email}
                    onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                    placeholder="location@example.com"
                  />
                </div>
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

