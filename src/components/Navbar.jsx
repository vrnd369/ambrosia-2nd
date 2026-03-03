import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SectionThreeNavbar.css';
import '../pages/Auth.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Why Ambrosia', href: '/about' },
  { label: 'Community', href: '/community' },
  { label: 'Buy Now', href: '/buy' },
  { label: 'Contact Us', href: '/contact' },
];

function Navbar() {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  // Close menu on scroll
  useEffect(() => {
    const close = () => { setMenuOpen(false); setUserDropdownOpen(false); };
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, []);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.name || user?.email?.split('@')[0] || '';

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
        style={{ position: 'fixed', top: 0, margin: '0 auto', transform: 'none', left: 'auto', zIndex: 1000 }}
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
                onClick={() => { navigate('/cart'); setUserDropdownOpen(false); }}
                id="dropdown-my-orders"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                My Cart
              </button>
              <button
                className="navbar-user-dropdown-item navbar-user-dropdown-item--danger"
                onClick={handleLogout}
                id="dropdown-logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <button
          className="navbar-cart-btn"
          onClick={() => navigate('/cart')}
          id="navbar-cart-btn"
          aria-label="Open cart"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C27.9411 0 36 8.05887 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0ZM14.1074 27.0068C13.3272 27.0068 12.6934 27.6407 12.6934 28.4209C12.6934 29.2011 13.3272 29.835 14.1074 29.835C14.8876 29.8349 15.5215 29.2011 15.5215 28.4209C15.5215 27.6407 14.8876 27.0069 14.1074 27.0068ZM22.5488 27.0068C21.7686 27.0068 21.1338 27.6407 21.1338 28.4209C21.1338 29.2011 21.7686 29.835 22.5488 29.835C23.3289 29.8348 23.9629 29.201 23.9629 28.4209C23.9629 27.6408 23.3289 27.007 22.5488 27.0068ZM6.98926 10.0332L9.13379 10.8545L9.7998 13.3369C9.79983 13.3915 9.80471 13.4464 9.81836 13.501L12.1777 22.2295L10.5488 23.6299L10.5029 23.6758C10.0923 24.0864 10.0014 24.7249 10.2295 25.2725C10.4576 25.8199 11.0046 26.1396 11.5977 26.1396H26.1074V24.7705H11.5977C11.5673 24.7704 11.5372 24.7549 11.5068 24.7246V24.6338L13.2637 23.1279H26.1533C26.5182 23.1278 26.7922 22.9 26.8379 22.5352L28.4346 13.4092C28.4801 13.2269 28.4344 12.9992 28.2979 12.8623C28.161 12.7254 27.9781 12.6338 27.75 12.6338H11.0371L10.3662 10.1699C10.3206 9.98741 10.1832 9.80512 9.95508 9.71387L7.49121 8.70996L6.98926 10.0332ZM25.5596 21.7139H13.5146L11.4609 14.0029H26.8828L25.5596 21.7139ZM15.4307 20.0254H23.2783V18.6113H15.4307V20.0254ZM14.5635 17.1504H23.9629V15.7363H14.5635V17.1504Z" />
          </svg>
          {totalItems > 0 && (
            <span className="navbar-cart-badge" key={totalItems}>
              {totalItems}
            </span>
          )}
        </button>
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

          {/* Cart icon */}
          <button
            className="navbar-cart-btn navbar-cart-btn--mobile"
            onClick={() => { navigate('/cart'); setMenuOpen(false); }}
            aria-label="Open cart"
          >
            <svg width="30" height="30" viewBox="0 0 36 36" fill="#fff" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C27.9411 0 36 8.05887 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0ZM14.1074 27.0068C13.3272 27.0068 12.6934 27.6407 12.6934 28.4209C12.6934 29.2011 13.3272 29.835 14.1074 29.835C14.8876 29.8349 15.5215 29.2011 15.5215 28.4209C15.5215 27.6407 14.8876 27.0069 14.1074 27.0068ZM22.5488 27.0068C21.7686 27.0068 21.1338 27.6407 21.1338 28.4209C21.1338 29.2011 21.7686 29.835 22.5488 29.835C23.3289 29.8348 23.9629 29.201 23.9629 28.4209C23.9629 27.6408 23.3289 27.007 22.5488 27.0068ZM6.98926 10.0332L9.13379 10.8545L9.7998 13.3369C9.79983 13.3915 9.80471 13.4464 9.81836 13.501L12.1777 22.2295L10.5488 23.6299L10.5029 23.6758C10.0923 24.0864 10.0014 24.7249 10.2295 25.2725C10.4576 25.8199 11.0046 26.1396 11.5977 26.1396H26.1074V24.7705H11.5977C11.5673 24.7704 11.5372 24.7549 11.5068 24.7246V24.6338L13.2637 23.1279H26.1533C26.5182 23.1278 26.7922 22.9 26.8379 22.5352L28.4346 13.4092C28.4801 13.2269 28.4344 12.9992 28.2979 12.8623C28.161 12.7254 27.9781 12.6338 27.75 12.6338H11.0371L10.3662 10.1699C10.3206 9.98741 10.1832 9.80512 9.95508 9.71387L7.49121 8.70996L6.98926 10.0332ZM25.5596 21.7139H13.5146L11.4609 14.0029H26.8828L25.5596 21.7139ZM15.4307 20.0254H23.2783V18.6113H15.4307V20.0254ZM14.5635 17.1504H23.9629V15.7363H14.5635V17.1504Z" />
            </svg>
            {totalItems > 0 && (
              <span className="navbar-cart-badge" key={totalItems}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Dropdown menu panel */}
        <div className={`navbar-mobile-menu ${menuOpen ? 'navbar-mobile-menu--open' : ''}`}>
          {/* User info or login button at top of mobile menu */}
          {isAuthenticated ? (
            <div className="navbar-mobile-user-info">
              <div className="navbar-mobile-user-avatar" style={{ padding: '0 14px', width: 'auto', borderRadius: '25px' }}>{userName || 'User'}</div>
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
            <button
              className="navbar-mobile-logout-link"
              onClick={handleLogout}
            >
              Log Out
            </button>
          ) : (
            <button
              className="navbar-mobile-auth-btn"
              onClick={() => { navigate('/auth'); setMenuOpen(false); }}
              id="navbar-mobile-login-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
