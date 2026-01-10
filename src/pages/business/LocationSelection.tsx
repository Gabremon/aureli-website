import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';
import './LocationSelection.css';

interface Location {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

export default function LocationSelection() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

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

      // If only one location, auto-select it
      if (data.locations && data.locations.length === 1) {
        setSelectedLocationId(data.locations[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (locationId: number) => {
    try {
      setError(null);

      // Find the location name from the locations array
      const selectedLocation = locations.find(loc => loc.id === locationId);
      
      // Store selected location ID and name in localStorage
      localStorage.setItem('selectedLocationId', locationId.toString());
      if (selectedLocation) {
        localStorage.setItem('selectedLocationName', selectedLocation.name);
      }

      // Also store in sessionStorage for current session
      sessionStorage.setItem('selectedLocationId', locationId.toString());
      if (selectedLocation) {
        sessionStorage.setItem('selectedLocationName', selectedLocation.name);
      }

      // Navigate to business dashboard
      navigate('/business-owner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select location');
      console.error('Error selecting location:', err);
    }
  };

  const handleContinue = () => {
    if (selectedLocationId) {
      handleLocationSelect(selectedLocationId);
    } else {
      setError('Please select a location to continue');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="location-selection-container">
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

  if (error && locations.length === 0) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="location-selection-container">
              <div className="error-container">
                <h2>Error Loading Locations</h2>
                <p>{error}</p>
                <button onClick={fetchLocations} className="button-primary">
                  Try Again
                </button>
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
          <div className="location-selection-container">
            <div className="location-selection-header">
              <h1 className="dashboard-title">Select a Location</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.name}. Please select a location to continue.
              </p>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee', color: '#c33', borderRadius: '4px' }}>
                {error}
              </div>
            )}

            {locations.length === 0 ? (
              <div className="no-locations-container">
                <p>No locations found for your business.</p>
                <p>Please contact your administrator to add a location.</p>
              </div>
            ) : (
              <>
                <div className="locations-grid">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className={`location-card ${selectedLocationId === location.id ? 'selected' : ''}`}
                      onClick={() => setSelectedLocationId(location.id)}
                    >
                      <div className="location-card-header">
                        <h3 className="location-name">{location.name}</h3>
                        {!location.is_active && (
                          <span className="location-badge inactive">Inactive</span>
                        )}
                        {location.is_active && (
                          <span className="location-badge active">Active</span>
                        )}
                      </div>
                      <div className="location-card-body">
                        {location.address && (
                          <p className="location-address">
                            <strong>Address:</strong> {location.address}
                          </p>
                        )}
                        {(location.city || location.state || location.zip_code) && (
                          <p className="location-city-state">
                            {[
                              location.city,
                              location.state,
                              location.zip_code
                            ].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {location.phone && (
                          <p className="location-phone">
                            <strong>Phone:</strong> {location.phone}
                          </p>
                        )}
                        {location.email && (
                          <p className="location-email">
                            <strong>Email:</strong> {location.email}
                          </p>
                        )}
                      </div>
                      {selectedLocationId === location.id && (
                        <div className="location-card-selected">
                          <span className="checkmark">✓ Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="location-selection-actions">
                  <button
                    onClick={handleContinue}
                    className="button-primary"
                    disabled={!selectedLocationId}
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

