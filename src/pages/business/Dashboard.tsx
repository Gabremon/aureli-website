import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import EmployeePipeline from '../../components/business/EmployeePipeline';
import '../../styles/Dashboard.css';
import '../../styles/business/business.css';

export default function BusinessOwnerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page business-dashboard">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container has-pipeline">
          <div className="dashboard-header" style={{ padding: '2rem 2rem 1rem 2rem', maxWidth: '100%' }}>
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
            <EmployeePipeline />
          </div>
        </div>
      </main>
    </div>
  );
}

