import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Hire", path: "/hire" },
    { label: "Referrals", path: "/referrals" },
  ];

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
          <a className="nav__link" href="#contact">
            Request Demo
          </a>
          <a className="nav__cta" href="#contact">
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}

