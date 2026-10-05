import { NavLink, Link } from 'react-router-dom';

function LogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#2D8A3C" />
      <path
        d="M20 28C20 28 12 22 12 16C12 13.8 13.8 12 16 12C17.5 12 18.8 12.8 19.5 14C20.2 12.8 21.5 12 23 12C25.2 12 27 13.8 27 16C27 22 20 28 20 28Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M20 10V18M16 14L20 10L24 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="14" cy="26" rx="3" ry="5" fill="#4CAF50" transform="rotate(-30 14 26)" />
      <ellipse cx="26" cy="26" rx="3" ry="5" fill="#4CAF50" transform="rotate(30 26 26)" />
    </svg>
  );
}

const navLinks = [
  { label: 'Home', to: '/', route: true },
  { label: 'About Us', to: '/about', route: true },
  { label: 'Marketplace', to: '/marketplace', route: true },
  { label: 'Price Prediction', to: '/#features', route: false },
  { label: 'Farming Advice', to: '/#features', route: false },
  { label: 'How It Works', to: '/#how-it-works', route: false },
];

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <LogoIcon />
          <div className="header__brand">
            <span className="header__name">AgroLink</span>
            <span className="header__tagline">Farm. Connect. Prosper.</span>
          </div>
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          {navLinks.map((link) =>
            link.route ? (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `header__link${isActive ? ' header__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a key={link.label} href={link.to} className="header__link">
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="header__actions">
          <Link to="/login" className="btn btn--outline">Log In</Link>
          <Link to="/register" className="btn btn--primary">Sign Up</Link>
        </div>

        <button className="header__menu-btn" aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
