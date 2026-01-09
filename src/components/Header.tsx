import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Hire", path: "/hire" },
    { label: "Referrals", path: "/referrals" },
    { label: "I-9 Center", path: "/i9-center" },
    { label: "Onboard", path: "/onboard" },
    { label: "Compliance", path: "/compliance" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'business_owner':
        return '/business-owner';
      case 'employee':
        return '/employee';
      default:
        return '/';
    }
  };

  return (
    <header className="header">
      <nav className="nav" data-reveal aria-label="Primary">
        <Link className="nav__brand" to="/" aria-label="Aureli Home">
          <span className="nav__logo">Aureli</span>
        </Link>
        <div className="nav__links">
          {navLinks.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={isActive ? "nav__link nav__link--active" : "nav__link"}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="nav__actions">
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardPath()} className="nav__link">
                {user.name} ({user.role === 'admin' ? 'Admin' : user.role === 'business_owner' ? 'Owner' : 'Employee'})
              </Link>
              <button onClick={handleLogout} className="nav__cta" style={{ cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a className="nav__link" href="#contact">
                Request Demo
              </a>
              <Link className="nav__cta" to="/login">
                Sign In
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

