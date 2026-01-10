import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';

export default function BusinessOwnerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page business-dashboard">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Business Owner Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.name} ({user?.email})
              </p>
            </div>
            <button onClick={logout} className="dashboard-logout">
              Logout
            </button>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <h2 className="section-title">Your Business</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Hiring Management</h3>
                  <p>Manage your hiring needs and view predictions</p>
                </div>
                <div className="feature-card">
                  <h3>Employee Management</h3>
                  <p>View and manage your employees</p>
                </div>
                <div className="feature-card">
                  <h3>Analytics</h3>
                  <p>View hiring analytics and workforce insights</p>
                </div>
                <div className="feature-card">
                  <h3>Settings</h3>
                  <p>Manage your business profile and preferences</p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="actions-grid">
                <button className="action-button">View Hiring Needs</button>
                <button className="action-button">Manage Employees</button>
                <button className="action-button">View Reports</button>
                <button className="action-button">Business Settings</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

