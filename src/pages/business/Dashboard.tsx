import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BusinessHeader from '../../components/BusinessHeader';
import EmployeePipeline from '../../components/business/EmployeePipeline';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';

export default function BusinessOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a location has been selected
    const selectedLocationId = localStorage.getItem('selectedLocationId') || sessionStorage.getItem('selectedLocationId');
    
    if (!selectedLocationId) {
      // Redirect to location selection if no location is selected
      navigate('/business-owner/location-selection');
    }
  }, [navigate]);

  // Don't render dashboard content until location is selected
  const selectedLocationId = localStorage.getItem('selectedLocationId') || sessionStorage.getItem('selectedLocationId');
  if (!selectedLocationId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="dashboard-page business-dashboard">
      <BusinessHeader />
      <main className="dashboard-main">
        <div className="dashboard-container has-pipeline">
          <div className="dashboard-header" style={{ padding: '2rem 2rem 1rem 2rem', maxWidth: '100%' }}>
            <div>
              <h1 className="dashboard-title">Business Owner Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.name} ({user?.email})
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <EmployeePipeline />
          </div>
        </div>
      </main>
    </div>
  );
}

