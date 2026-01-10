import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import './BusinessHeader.css';

export default function BusinessHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, token } = useAuth();
  const [locationName, setLocationName] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const businessNavLinks = [
    { label: "Dashboard", path: "/business-owner" },
    { label: "Locations", path: "/business-owner/locations" },
    { label: "Applicants", path: "/business-owner" }, // Will show the pipeline on dashboard
  ];

  useEffect(() => {
    fetchLocationName();
  }, [token]);

  const fetchLocationName = async () => {
    const selectedLocationId = localStorage.getItem('selectedLocationId') || sessionStorage.getItem('selectedLocationId');
    
    if (!selectedLocationId || !token) {
      setLocationName(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/business/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const location = data.locations?.find((loc: any) => loc.id.toString() === selectedLocationId);
        if (location) {
          setLocationName(location.name);
        } else {
          setLocationName(null);
        }
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocationName(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Clear location selection on logout
    localStorage.removeItem('selectedLocationId');
    sessionStorage.removeItem('selectedLocationId');
    setLocationName(null);
    navigate('/');
  };

  const getSelectedLocationName = () => {
    const selectedLocationId = localStorage.getItem('selectedLocationId') || sessionStorage.getItem('selectedLocationId');
    if (!selectedLocationId) return null;
    
    // Try to get name from localStorage/sessionStorage first (faster)
    const storedName = localStorage.getItem('selectedLocationName') || sessionStorage.getItem('selectedLocationName');
    return storedName || locationName || 'Location Selected';
  };

  return (
    <header className="business-header">
      <nav className="business-nav" aria-label="Business Navigation">
        <Link className="business-nav__brand" to="/business-owner" aria-label="Aureli Business">
          <span className="business-nav__logo">Aureli</span>
          <span className="business-nav__role">Business</span>
        </Link>
        <div className="business-nav__links">
          {businessNavLinks.map(({ label, path }) => {
            const isActive = location.pathname === path || 
                           (path === "/business-owner" && location.pathname === "/business-owner");
            return (
              <Link
                key={label}
                to={path}
                className={`business-nav__link ${isActive ? 'business-nav__link--active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="business-nav__actions">
          {isAuthenticated && user ? (
            <>
              <div className="business-nav__user-info">
                <span className="business-nav__user-name">{user.name}</span>
                {getSelectedLocationName() && (
                  <span className="business-nav__location-indicator" title="Selected Location">
                    📍 {getSelectedLocationName()}
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="business-nav__logout" title="Logout">
                Logout
              </button>
            </>
          ) : (
            <Link className="business-nav__login" to="/login">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

