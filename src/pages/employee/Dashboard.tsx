import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import '../../styles/Dashboard.css';
import '../../styles/employee/employee.css';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page employee-dashboard">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Employee Dashboard</h1>
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
              <h2 className="section-title">Your Account</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Profile</h3>
                  <p>View and update your profile information</p>
                </div>
                <div className="feature-card">
                  <h3>Documents</h3>
                  <p>Access your documents and forms</p>
                </div>
                <div className="feature-card">
                  <h3>Schedule</h3>
                  <p>View your work schedule and availability</p>
                </div>
                <div className="feature-card">
                  <h3>Resources</h3>
                  <p>Access employee resources and tools</p>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="actions-grid">
                <button className="action-button">Update Profile</button>
                <button className="action-button">View Documents</button>
                <button className="action-button">View Schedule</button>
                <button className="action-button">Contact HR</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

