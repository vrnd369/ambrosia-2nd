import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, validators, getPasswordStrength } from '../context/AuthContext';
import './Auth.css';
import { LuRocket } from 'react-icons/lu';
import { SlLock } from 'react-icons/sl';
import { BiSolidOffer } from 'react-icons/bi';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginWithGoogle, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Determine where to redirect after auth
  const from = location.state?.from || '/';

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Field-level errors (shown on blur or submit)
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailRef = useRef(null);
  const nameRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Focus first field on mode switch
  useEffect(() => {
    clearError();
    setTouched({});
    setFieldErrors({});
    setSubmitAttempted(false);
    setShowPassword(false);
    setShowConfirm(false);
    if (mode === 'signup' && nameRef.current) {
      nameRef.current.focus();
    } else if (emailRef.current) {
      emailRef.current.focus();
    }
  }, [mode, clearError]);

  // Validate a single field
  function validateField(name, value) {
    switch (name) {
      case 'name':
        return validators.name(value);
      case 'email':
        return validators.email(value);
      case 'password':
        return validators.password(value);
      case 'confirmPassword':
        return validators.confirmPassword(value, form.password);
      default:
        return '';
    }
  }

  // On change
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // If field was touched or submit was attempted, validate in real-time
    if (touched[name] || submitAttempted) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }

    // Also re-validate confirmPassword when password changes
    if (name === 'password' && (touched.confirmPassword || submitAttempted) && mode === 'signup') {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: validators.confirmPassword(form.confirmPassword, value),
      }));
    }
  }

  // On blur
  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Skip name validation in login mode
    if (name === 'name' && mode === 'login') return;
    // Skip confirmPassword in login mode
    if (name === 'confirmPassword' && mode === 'login') return;
    // Skip password strength validation in login mode
    if (name === 'password' && mode === 'login') {
      setFieldErrors(prev => ({ ...prev, [name]: value ? '' : 'Password is required' }));
      return;
    }

    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }

  // Full-form validation
  function validateAll() {
    const errors = {};
    if (mode === 'signup') {
      errors.name = validators.name(form.name);
    }
    errors.email = validators.email(form.email);
    if (mode === 'signup') {
      errors.password = validators.password(form.password);
      errors.confirmPassword = validators.confirmPassword(form.confirmPassword, form.password);
    } else {
      errors.password = form.password ? '' : 'Password is required';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    clearError();

    const errors = validateAll();
    setFieldErrors(errors);

    // Check if any errors
    const hasErrors = Object.values(errors).some(err => err);
    if (hasErrors) return;

    let success;
    if (mode === 'login') {
      success = await login(form.email, form.password);
    } else {
      success = await signup(form.name, form.email, form.password);
    }

    if (success) {
      navigate(from, { replace: true });
    }
  }

  const passwordStrength = mode === 'signup' ? getPasswordStrength(form.password) : null;

  return (
    <div className="auth-page">
      {/* Back to home */}
      <button
        className="auth-back-btn"
        onClick={() => navigate('/')}
        type="button"
        id="auth-back-home"
        aria-label="Back to home"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Home
      </button>

      {/* Decorative background elements */}
      <div className="auth-bg-blob auth-bg-blob--1"></div>
      <div className="auth-bg-blob auth-bg-blob--2"></div>
      <div className="auth-bg-blob auth-bg-blob--3"></div>

      <div className="auth-container">
        {/* Left panel — branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <h1 className="auth-brand-logo" onClick={() => navigate('/')}>
              Ambrosia
            </h1>
            <p className="auth-brand-tagline">
              Fuel your flow.
              <br />
              Premium hydration awaits.
            </p>
            <div className="auth-brand-features">
              <div className="auth-brand-feature">
                <span className="auth-feature-icon">
                  <LuRocket />
                </span>
                <span>Fast &amp; Free Delivery</span>
              </div>
              <div className="auth-brand-feature">
                <span className="auth-feature-icon">
                  <SlLock />
                </span>
                <span>Secure Checkout</span>
              </div>
              <div className="auth-brand-feature">
                <span className="auth-feature-icon">
                  <BiSolidOffer />
                </span>
                <span>Exclusive Member Offers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => setMode('login')}
                type="button"
                id="auth-tab-login"
              >
                Log In
              </button>
              <button
                className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
                onClick={() => setMode('signup')}
                type="button"
                id="auth-tab-signup"
              >
                Sign Up
              </button>
              <div
                className="auth-tab-indicator"
                style={{ transform: mode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}
              />
            </div>

            <h2 className="auth-form-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Enter your credentials to access your account'
                : 'Join Ambrosia and start your journey'}
            </p>

            {/* Server error */}
            {error && (
              <div className="auth-error-banner" role="alert">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* Name — signup only */}
              {mode === 'signup' && (
                <div className={`auth-field ${fieldErrors.name ? 'auth-field--error' : ''}`}>
                  <label htmlFor="auth-name" className="auth-label">
                    Full Name
                  </label>
                  <div className="auth-input-wrapper">
                    <svg
                      className="auth-input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      ref={nameRef}
                      id="auth-name"
                      name="name"
                      type="text"
                      className="auth-input"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && <span className="auth-field-error">{fieldErrors.name}</span>}
                </div>
              )}

              {/* Email */}
              <div className={`auth-field ${fieldErrors.email ? 'auth-field--error' : ''}`}>
                <label htmlFor="auth-email" className="auth-label">
                  Email Address
                </label>
                <div className="auth-input-wrapper">
                  <svg
                    className="auth-input-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    ref={emailRef}
                    id="auth-email"
                    name="email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
              </div>

              {/* Password */}
              <div className={`auth-field ${fieldErrors.password ? 'auth-field--error' : ''}`}>
                <label htmlFor="auth-password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <svg
                    className="auth-input-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder={
                      mode === 'login' ? 'Enter your password' : 'Min 8 chars, upper, lower, number, symbol'
                    }
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}

                {/* Password strength meter — signup only */}
                {mode === 'signup' && form.password && (
                  <div className="auth-pw-strength">
                    <div className="auth-pw-strength-bar">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`auth-pw-strength-segment ${i < passwordStrength.score ? 'auth-pw-strength-segment--filled' : ''}`}
                          style={
                            i < passwordStrength.score ? { backgroundColor: passwordStrength.color } : {}
                          }
                        />
                      ))}
                    </div>
                    <span className="auth-pw-strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password — signup only */}
              {mode === 'signup' && (
                <div className={`auth-field ${fieldErrors.confirmPassword ? 'auth-field--error' : ''}`}>
                  <label htmlFor="auth-confirm-password" className="auth-label">
                    Confirm Password
                  </label>
                  <div className="auth-input-wrapper">
                    <svg
                      className="auth-input-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-toggle-pw"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span className="auth-field-error">{fieldErrors.confirmPassword}</span>
                  )}
                </div>
              )}

              {/* Forgot password link — login only */}
              {mode === 'login' && (
                <div className="auth-forgot-row">
                  <button type="button" className="auth-forgot-link" id="auth-forgot-password">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="auth-submit-btn" disabled={isLoading} id="auth-submit">
                {isLoading ? (
                  <span className="auth-spinner"></span>
                ) : mode === 'login' ? (
                  'Log In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Social buttons (placeholder — no real OAuth) */}
            <div className="auth-social-btns">
              <button
                className="auth-social-btn"
                type="button"
                id="auth-google"
                onClick={loginWithGoogle}
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Mode switch */}
            <p className="auth-mode-switch">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="auth-mode-link"
                    onClick={() => setMode('signup')}
                    id="auth-switch-to-signup"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-mode-link"
                    onClick={() => setMode('login')}
                    id="auth-switch-to-login"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
