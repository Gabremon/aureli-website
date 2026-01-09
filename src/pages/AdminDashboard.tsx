import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../styles/Dashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Admin Dashboard</h1>
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
              <h2 className="section-title">Admin Features</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>User Management</h3>
                  <p>Manage all users, roles, and permissions</p>
                </div>
                <div className="feature-card">
                  <h3>System Settings</h3>
                  <p>Configure system-wide settings and preferences</p>
                </div>
                <div className="feature-card">
                  <h3>Analytics & Reports</h3>
                  <p>View comprehensive analytics and generate reports</p>
                </div>
                <div className="feature-card">
                  <h3>Business Management</h3>
                  <p>Manage all businesses and their settings</p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="actions-grid">
                <button className="action-button">Create New User</button>
                <button className="action-button">View All Users</button>
                <button className="action-button">System Logs</button>
                <button className="action-button">Backup Database</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

