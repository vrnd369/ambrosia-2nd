import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Contact.css';
import colourfulGrad from '../assets/colourful-gradient.webp';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    spaceType: 'Retail Store',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmitted(false);

    try {
      const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_ENQUIRY_URL;
      const sheetPromise = sheetUrl
        ? fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: new Date().toISOString(),
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              spaceType: formData.spaceType,
              message: formData.message,
            }),
          })
        : Promise.reject(new Error('Google Sheet URL is not configured'));

      const emailPromise = emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          spaceType: formData.spaceType,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      const [sheetResult, emailResult] = await Promise.allSettled([
        sheetPromise,
        emailPromise,
      ]);

      let errorMessage = '';

      if (emailResult.status === 'rejected') {
        console.error('EmailJS error:', emailResult.reason);
        errorMessage += 'Email service failed. ';
      }

      if (sheetResult.status === 'rejected') {
        console.error('Google Sheets error:', sheetResult.reason);
        errorMessage += 'Database saving failed. ';
      }

      if (emailResult.status === 'rejected' && sheetResult.status === 'rejected') {
        setError('Failed to send request. Both services are down. Please try again later.');
        return; // Early return, do not clear form 
      } else if (errorMessage) {
        setError(errorMessage + 'However, partial submission was successful.');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        spaceType: 'Retail Store',
        message: '',
      });
      setTimeout(() => {
        setSubmitted(false);
        setError(null);
      }, 5000);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  return (
    <div className="contact-page">
      <section className="contact-hero" style={{ backgroundImage: `url(${colourfulGrad})` }}>
        <div className="contact-content-wrapper">
          <h1 className="contact-title">Let’s Talk</h1>
          <p className="contact-subtitle">Questions? Ideas? Want to stock Ambrosia in your space?</p>

          <div className="contact-cards-container">
            {/* Left Card */}
            <div className="contact-card card-left">
              <p className="contact-text">
                <span className="contact-bold">Email:</span> hello@not4you.com
              </p>
              <p className="contact-text">
                <span className="contact-bold">Phone:</span> +91 98480 12345
              </p>
            </div>

            {/* Right Card */}
            <div className="contact-card card-right">
              <h2 className="contact-card-title">Find us:</h2>
              <p className="contact-text">Banjara Hills, Hyderabad, India</p>
              <p className="contact-text text-light">(Come say hi. We're fun, promise.)</p>
              {/* <a href="https://maps.app.goo.gl/ycYNYTYze88smWvEA" target="_blank" className="contact-link">
                Open maps &gt;
              </a> */}
            </div>
          </div>

          <div className="contact-enquiry-wrapper">
            <div className="enquiry-card">
              <h2 className="enquiry-title">Distributor / Retail Enquiries</h2>
              <p className="enquiry-subtitle">
                Want Ambrosia in your café, store, or wellness space? Let's make it happen.
              </p>

              <form className="enquiry-form" onSubmit={handleSubmit}>
                <div className="enquiry-row">
                  <div className="enquiry-field">
                    <label className="enquiry-label" htmlFor="name">NAME</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="enquiry-input"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="enquiry-field">
                    <label className="enquiry-label" htmlFor="email">EMAIL</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="enquiry-input"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="enquiry-row">
                  <div className="enquiry-field">
                    <label className="enquiry-label" htmlFor="phone">PHONE</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="enquiry-input"
                      placeholder="+91..."
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="enquiry-field">
                    <label className="enquiry-label" htmlFor="spaceType">YOUR SPACE TYPE</label>
                    <select
                      id="spaceType"
                      name="spaceType"
                      className="enquiry-select"
                      value={formData.spaceType}
                      onChange={handleChange}
                    >
                      <option value="Retail Store">Retail Store</option>
                      <option value="Café / Restaurant">Café / Restaurant</option>
                      <option value="Wellness Space">Wellness Space</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="enquiry-field enquiry-field--full">
                  <label className="enquiry-label" htmlFor="message">MESSAGE / DETAILS</label>
                  <textarea
                    id="message"
                    name="message"
                    className="enquiry-textarea"
                    placeholder="Tell us about your space and what you're looking for..."
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={`enquiry-submit ${submitted ? 'enquiry-submit--sent' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : submitted ? 'Sent ✓' : 'Send Request →'}
                </button>
                {error && <p className="enquiry-error" style={{ color: '#ff4d4f', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="contact-faq-section">
        <div className="contact-faq-container">
          <h2 className="faq-main-title">FAQ's</h2>

          <div className="faq-item">
            <h3 className="faq-question">Will this get me high?</h3>
            <p className="faq-answer">
              Nope. You'll feel good, not altered. Think "best version of you" not "different person
              entirely."
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Is there caffeine?</h3>
            <p className="faq-answer">Not a drop. Just natural plant energy that won't make you vibrate.</p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Can I drink this every day?</h3>
            <p className="faq-answer">Please do. Your stress levels will thank you.</p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Does it taste like health food?</h3>
            <p className="faq-answer">
              Absolutely not. It tastes like a delicious botanical drink that happens to be good for you. Wild
              concept, we know.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">How long till I feel it?</h3>
            <p className="faq-answer">About 20 - 30 minutes. It's subtle but very, very real.</p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Can I mix it with alcohol?</h3>
            <p className="faq-answer">You can, but why would you ruin a good thing?</p>
          </div>
        </div>
      </section>
    </div>
  );
}
