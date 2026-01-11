import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import OpeningPipeline from '../../components/business/OpeningPipeline';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';
import './OpeningDetail.css';

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

export default function OpeningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [opening, setOpening] = useState<Opening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (id) {
      fetchOpening();
    }
  }, [id, token]);

  const fetchOpening = async () => {
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
        throw new Error(errorData.error || 'Failed to fetch opening');
      }

      const data = await response.json();
      const foundOpening = data.openings?.find((o: Opening) => o.id.toString() === id);
      
      if (!foundOpening) {
        throw new Error('Opening not found');
      }

      setOpening(foundOpening);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opening');
      console.error('Error fetching opening:', err);
    } finally {
      setLoading(false);
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
            <div className="opening-detail-loading">
              <p>Loading opening details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !opening) {
    return (
      <div className="dashboard-page business-dashboard">
        <BusinessHeader />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="opening-detail-error">
              <h2>Error</h2>
              <p>{error || 'Opening not found'}</p>
              <button onClick={() => navigate('/business-owner')} className="button-primary">
                Back to Openings
              </button>
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
          <div className="opening-detail-container">
            <div className="opening-detail-header">
              <button
                onClick={() => navigate('/business-owner')}
                className="back-button"
              >
                ← Back to Openings
              </button>
              
              <div className="opening-detail-info">
                <h1 className="opening-detail-title">{opening.title}</h1>
                <div className="opening-detail-meta">
                  <div className="opening-meta-item">
                    <span className="opening-meta-label">Location:</span>
                    <span className="opening-meta-value">
                      {opening.location_name}
                      {opening.location_city && opening.location_state && (
                        <span className="opening-meta-location">
                          {' - '}{opening.location_city}, {opening.location_state}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="opening-meta-item">
                    <span className="opening-meta-label">Applications:</span>
                    <span className="opening-meta-value">{opening.application_count}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="opening-pipeline-container">
              <OpeningPipeline openingId={opening.id} openingTitle={opening.title} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

