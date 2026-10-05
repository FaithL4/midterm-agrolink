import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img src="/logo.png" alt="AgroLink" className="h-16 md:h-20 w-auto object-contain block" />
    </Link>
  );
}

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout, dashboardPath } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {publicLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to={dashboardPath} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                {user.role === 'buyer' && (
                  <Link to="/buyer/cart" className="relative px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-700">
                    Cart {count > 0 && <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{count}</span>}
                  </Link>
                )}
                <span className="flex items-center gap-1 text-sm text-gray-600"><User size={14} /> {user.first_name || user.username}</span>
                <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-green-700 border border-green-600 rounded-lg hover:bg-green-50">Log In</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800">Sign Up</Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-green-100 bg-white px-4 py-4 space-y-2">
          {publicLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50">{l.label}</NavLink>
          ))}
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="block px-3 py-2 text-green-700">Dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left px-3 py-2 text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-green-700">Log In</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-green-700 font-medium">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
