import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SectionThreeNavbar.css';
import '../pages/Auth.css';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Why Ambrosia', href: '/about' },
  { label: 'Community', href: '/community' },
  { label: 'Buy Now', href: '/buy' },
  { label: 'Contact Us', href: '/contact' },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  // Close menu on scroll
  useEffect(() => {
    const close = () => {
      setMenuOpen(false);
      setUserDropdownOpen(false);
    };
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, []);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split('@')[0] ||
    '';

  function handleLogout() {
    logout();
    setUserDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <div className="s3-navbar-wrapper" style={{ background: '#f8f8f8', padding: 0 }}>
      {/* --- DESKTOP NAV --- */}
      <nav
        className="s3-navbar navbar-pages navbar-desktop"
        style={{ position: 'fixed', top: '0.5rem', margin: '0 auto', transform: 'none', left: 'auto', zIndex: 1000 }}
      >
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.label}
            to={link.href}
            end={link.href === '/'}
            className={({ isActive }) => `s3-nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}

        {/* Auth button / User avatar */}
        {isAuthenticated ? (
          <div className="navbar-user-pill" ref={dropdownRef}>
            <div
              className="navbar-user-avatar"
              onClick={() => setUserDropdownOpen(v => !v)}
              title={userName}
              role="button"
              tabIndex={0}
              aria-label="User menu"
              id="navbar-user-avatar"
              style={{ width: 'auto', padding: '0 16px', borderRadius: '25px', fontSize: '0.85rem' }}
            >
              {userName || 'User'}
            </div>
            <div className={`navbar-user-dropdown ${userDropdownOpen ? 'navbar-user-dropdown--open' : ''}`}>
              <div className="navbar-user-dropdown-header">
                <div className="navbar-user-dropdown-name">{userName}</div>
                <div className="navbar-user-dropdown-email">{user?.email}</div>
              </div>
              <button
                className="navbar-user-dropdown-item"
                onClick={() => {
                  navigate('/cart');
                  setUserDropdownOpen(false);
                }}
                id="dropdown-my-cart"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                My Cart
              </button>
              <button
                className="navbar-user-dropdown-item"
                onClick={() => {
                  navigate('/order-history');
                  setUserDropdownOpen(false);
                }}
                id="dropdown-order-history"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Order History
              </button>
              <button
                className="navbar-user-dropdown-item navbar-user-dropdown-item--danger"
                onClick={handleLogout}
                id="dropdown-logout"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <button
            className="navbar-auth-btn"
            onClick={() => navigate('/auth')}
            id="navbar-login-btn"
            aria-label="Log in or sign up"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Login
          </button>
        )}


      </nav>

      {/* --- MOBILE NAV --- */}
      <div className="navbar-mobile" ref={menuRef}>
        <div className="navbar-mobile-bar">
          {/* Hamburger button */}
          <button
            className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>


        </div>

        {/* Dropdown menu panel */}
        <div className={`navbar-mobile-menu ${menuOpen ? 'navbar-mobile-menu--open' : ''}`}>
          {/* User info or login button at top of mobile menu */}
          {isAuthenticated ? (
            <div className="navbar-mobile-user-info">
              <div
                className="navbar-mobile-user-avatar"
                style={{ padding: '0 14px', width: 'auto', borderRadius: '25px' }}
              >
                {userName || 'User'}
              </div>
              <span className="navbar-mobile-user-name">{userName}</span>
            </div>
          ) : null}

          {NAV_LINKS.map(link => (
            <NavLink
              key={link.label}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <button
                className="navbar-mobile-link"
                onClick={() => {
                  navigate('/cart');
                  setMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                My Cart
              </button>
              <button
                className="navbar-mobile-link"
                onClick={() => {
                  navigate('/order-history');
                  setMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Order History
              </button>
              <button className="navbar-mobile-logout-link" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <button
              className="navbar-mobile-auth-btn"
              onClick={() => {
                navigate('/auth');
                setMenuOpen(false);
              }}
              id="navbar-mobile-login-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
