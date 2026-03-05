import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import './AdminLogin.css';

const ADMIN_EMAIL = 'ambrosiadrinks019@gmail.com';
const ADMIN_PASSWORD = 'Ambrosia@123#';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, isLoading, error, clearError, isAdmin } = useAuth();

  const [form, setForm] = useState({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || '/admin';

  // Redirect if already admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    let ok = await login(form.email, form.password);
    if (!ok && form.email === ADMIN_EMAIL) {
      ok = await signup('Ambrosia Admin', form.email, form.password);
    }
    setLoading(false);
    if (ok) {
      navigate(from, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-loading">
          <div className="loading-spinner" />
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <Link to="/" className="admin-login-back">
        <ArrowLeft size={18} />
        Back to site
      </Link>
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <Shield size={40} />
          </div>
          <h1>Admin Login</h1>
          <p>Ambrosia Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Admin email"
              required
              autoComplete="username"
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-login-password-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Admin password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
              {error.toLowerCase().includes('confirm') && (
                <p className="admin-login-error-hint">
                  Check your email for a confirmation link, or disable email confirmation in Supabase Dashboard → Authentication.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        <footer className="admin-login-footer">
          Developed by{' '}
          <a href="https://www.wikiwakywoo.com/" target="_blank" rel="noopener noreferrer" className="admin-login-footer-link">
            <strong>WikiWakyWoo</strong>
          </a>
          {' '}· CMS Dashboard
        </footer>
      </div>
    </div>
  );
}
