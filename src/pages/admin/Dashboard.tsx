import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import DatabaseManagement from '../../components/admin/DatabaseManagement';
import '../../styles/Dashboard.css';
import '../../styles/admin/admin.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page admin-dashboard">
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
            <DatabaseManagement />
          </div>
        </div>
      </main>
    </div>
  );
}

