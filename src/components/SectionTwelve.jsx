import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.webp';
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6';

// ─── Google Sheets Integration ──────────────────────────────────────────────
// Replace this URL with your deployed Google Apps Script Web App URL.
// See setup instructions in: src/google-sheets-setup.md
const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL || '';

function SectionTwelve() {
  const [activePopup, setActivePopup] = useState(null);
  const [email, setEmail] = useState('');
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmitting = useRef(false);

  const openPopup = type => setActivePopup(type);
  const closePopup = () => setActivePopup(null);

  // ─── Email Validation ───────────────────────────────────────────────────
  const isValidEmail = value => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // ─── Form Submit Handler ────────────────────────────────────────────────
  const handleSubscribe = async e => {
    e.preventDefault();

    // Prevent double-submit
    if (isSubmitting.current) return;

    const trimmedEmail = email.trim();

    // Client-side validation
    if (!trimmedEmail) {
      setFormStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setFormStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!GOOGLE_SHEET_URL) {
      console.error('VITE_GOOGLE_SHEET_URL is not configured.');
      setFormStatus('error');
      setErrorMessage('Subscription is temporarily unavailable. Please try again later.');
      return;
    }

    isSubmitting.current = true;
    setFormStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script redirects; no-cors avoids CORS errors
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          email: trimmedEmail,
        }),
      });

      // With no-cors the response is opaque (status 0), so we treat it as success
      setFormStatus('success');
      setEmail('');

      // Reset to idle after 5 seconds so user can subscribe again if needed
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setFormStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      isSubmitting.current = false;
    }
  };

  return (
    <footer className="section-twelve">
      <div className="footer-container">
        {/* Top Row */}
        <div className="footer-top-row">
          <div className="footer-about-block">
            <h2 className="footer-about-title">About Ambrosia</h2>
            <p className="footer-about-desc">
              Alcohol-free botanical drinks for people who want to feel amazing without the drama. <br />
              Born in India. Made for everyone who's tired of the trade-off.
            </p>
          </div>

          <div className="footer-newsletter-block">
            <h2 className="footer-newsletter-title">Newsletter Signup</h2>
            <p className="footer-newsletter-desc">
              Join the Flow. Get first access to new drops, botanical tips, and general good vibes.
            </p>

            {formStatus === 'success' ? (
              <div className="footer-subscribe-success">
                <span className="footer-success-icon">✓</span>
                <span>You're in! Welcome to the flow.</span>
              </div>
            ) : (
              <form className="footer-form" onSubmit={handleSubscribe} noValidate>
                <input
                  type="email"
                  placeholder="your email address"
                  className={`footer-input${formStatus === 'error' ? ' footer-input-error' : ''}`}
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (formStatus === 'error') setFormStatus('idle');
                  }}
                  disabled={formStatus === 'loading'}
                  aria-label="Email address for newsletter"
                  autoComplete="email"
                  id="footer-newsletter-email"
                />
                <button type="submit" className="footer-subscribe-btn" disabled={formStatus === 'loading'}>
                  {formStatus === 'loading' ? 'Sending...' : 'Subscribe'}
                </button>
              </form>
            )}
            {formStatus === 'error' && errorMessage && (
              <p className="footer-form-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      <div className="footer-container">
        <div className="footer-wrapper">
          {/* Logo */}
          <div className="footer-logo-wrapper">
            <img src={logo} alt="Ambrosia" className="footer-logo" loading="lazy" decoding="async" />
          </div>

          {/* Big Footer Text */}
          <h1 className="footer-big-text">NOT FOR YOU</h1>

          {/* Footer Links */}
          <div className="footer-links">
            <div className="footer-link-col">
              <h4>Shop</h4>
              <ul>
                <li>
                  <Link to="/buy">Products</Link>
                </li>
                <li>
                  <a href="#">Merch</a>
                </li>
                <li>
                  <a href="#">Gift Cards</a>
                </li>
              </ul>
            </div>
            <div className="footer-link-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <Link to="/about">About Ambrosia</Link>
                </li>
                <li>
                  <Link to="/community">Community</Link>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press & Media</a>
                </li>
              </ul>
            </div>
            <div className="footer-link-col">
              <h4>Support</h4>
              <ul>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
                <li>
                  <Link to="/contact#faq">FAQ</Link>
                </li>
                <li>
                  <a href="#">Shipping & Returns</a>
                </li>
              </ul>
            </div>
            <div className="footer-link-col">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      openPopup('privacy');
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      openPopup('terms');
                    }}
                  >
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-social-section">
            <span className="footer-social-text">
              <span className="script-text">Follow</span> <span>the journey</span>
            </span>
            <div className="footer-social-icons">
              <a href="https://www.facebook.com/not4you.in" className="social-icon" target="_blank">
                <FaFacebookF />
              </a>
              <a href="https://www.instagram.com/not4you.in/" className="social-icon" target="_blank">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon">
                <FaXTwitter />
              </a>
              <a href="https://www.youtube.com/@Thedrinkambrosia" className="social-icon" target="_blank">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-copyright">&copy; 2026 Ambrosia. All rights reserved.</div>
        </div>
      </div>

      {activePopup && (
        <div className="legalModalOverlay" onClick={closePopup}>
          <div className="legalModalContent" onClick={e => e.stopPropagation()}>
            <button className="legalModalClose" onClick={closePopup}>
              &times;
            </button>
            <div className="legalModalBody">
              {activePopup === 'privacy' ? (
                <>
                  <h2>Privacy Policy</h2>
                  <p className="legalLastUpdated">Last updated: {new Date().toLocaleDateString()}</p>

                  <h3>1. Introduction</h3>
                  <p>
                    Welcome to Ambrosia. We respect your privacy and are committed to protecting your personal
                    data. This privacy policy will inform you as to how we look after your personal data when
                    you visit our website and tell you about your privacy rights.
                  </p>

                  <h3>2. The Data We Collect</h3>
                  <p>
                    We may collect, use, store and transfer different kinds of personal data about you,
                    including Identity Data (first name, last name), Contact Data (billing address, delivery
                    address, email, phone number), Financial Data (payment card details), and Transaction Data
                    (details about payments to and from you).
                  </p>

                  <h3>3. How We Use Your Data</h3>
                  <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use
                    your personal data to process and deliver your order, manage our relationship with you,
                    and send you marketing communications if you have opted in.
                  </p>

                  <h3>4. Data Security</h3>
                  <p>
                    We have put in place appropriate security measures to prevent your personal data from
                    being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
                  </p>

                  <h3>5. Your Legal Rights</h3>
                  <p>
                    Under certain circumstances, you have rights under data protection laws in relation to
                    your personal data, including the right to request access, correction, erasure, or
                    restriction of processing of your personal data.
                  </p>
                </>
              ) : (
                <>
                  <h2>Terms & Conditions</h2>
                  <p className="legalLastUpdated">Last updated: {new Date().toLocaleDateString()}</p>

                  <h3>1. General Terms</h3>
                  <p>
                    By accessing and placing an order with Ambrosia, you confirm that you are in agreement
                    with and bound by the terms of service contained in the Terms & Conditions outlined below.
                  </p>

                  <h3>2. Products and Pricing</h3>
                  <p>
                    All products are subject to availability. We reserve the right to limit the quantities of
                    any products or services that we offer. All descriptions of products or product pricing
                    are subject to change at any time without notice, at our sole discretion.
                  </p>

                  <h3>3. Payment Terms</h3>
                  <p>
                    We accept various methods of payment as indicated on our checkout page. You agree to
                    provide current, complete, and accurate purchase and account information for all purchases
                    made at our store.
                  </p>

                  <h3>4. Shipping and Delivery</h3>
                  <p>
                    Delivery times are estimates and commence from the date of shipping, rather than the date
                    of order. We are not responsible for any delays caused by destination customs clearance
                    processes or carrier delays.
                  </p>

                  <h3>5. Returns and Refunds</h3>
                  <p>
                    If you are not completely satisfied with your purchase, you may return it to us for a
                    refund or an exchange, subject to our Return Policy. Items must be returned in their
                    original condition within 14 days of delivery.
                  </p>

                  <h3>6. Limitation of Liability</h3>
                  <p>
                    Ambrosia shall not be liable for any direct, indirect, incidental, special, consequential
                    or exemplary damages resulting from your use of our products or website.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default SectionTwelve;
