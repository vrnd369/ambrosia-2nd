import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import cartIcon from '../assets/cart-icon.svg';

function FloatingButtons() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // On the Home page, SectionFour handles the shop button with its own scroll logic
  if (location.pathname === '/') return null;

  function handleShopClick(e) {
    e.preventDefault();
    if (location.pathname === '/buy') {
      // Already on /buy — scroll to the cart section
      const cartSection = document.querySelector('.buy-cart-section');
      if (cartSection) {
        cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/buy');
    }
  }

  return (
    <div className="s4-floating-wrapper fixed" style={{ pointerEvents: 'none', zIndex: 1000 }}>
      <a
        href="/buy"
        className="floating-shop-btn"
        data-cursor="eye"
        style={{ pointerEvents: 'auto' }}
        onClick={handleShopClick}
        aria-label={`Shop Now${totalItems > 0 ? `, ${totalItems} item${totalItems > 1 ? 's' : ''} in cart` : ''}`}
      >
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <img src={cartIcon} alt="Cart" className="cart-icon" loading="lazy" decoding="async" />
          {totalItems > 0 && (
            <span
              className="floating-cart-badge"
              key={totalItems}
              aria-hidden="true"
            >
              {totalItems}
            </span>
          )}
        </span>
        <span className="shop-text">SHOP NOW</span>
      </a>
    </div>
  );
}

export default FloatingButtons;

