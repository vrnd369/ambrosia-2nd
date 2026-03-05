import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Contact.css';
import colourfulGrad from '../assets/colourful-gradient.webp';

export default function Contact() {
  const location = useLocation();

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
              <a href="https://maps.app.goo.gl/ycYNYTYze88smWvEA" target="_blank" className="contact-link">
                Open maps &gt;
              </a>
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
