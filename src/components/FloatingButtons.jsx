import React from 'react';
import { useLocation } from 'react-router-dom';
import cartIcon from '../assets/cart-icon.svg';

function FloatingButtons() {
  const location = useLocation();

  // On the Home page, SectionFour handles the shop button with its own scroll logic
  if (location.pathname === '/') return null;

  return (
    <div className="s4-floating-wrapper fixed" style={{ pointerEvents: 'none', zIndex: 1000 }}>
      <a href="/buy" className="floating-shop-btn" data-cursor="eye" style={{ pointerEvents: 'auto' }}>
        <img src={cartIcon} alt="Cart" className="cart-icon" loading="lazy" decoding="async" />
        <span className="shop-text">SHOP NOW</span>
      </a>
    </div>
  );
}

export default FloatingButtons;
