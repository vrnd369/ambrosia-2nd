import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Buy.css';
import colourfulGrad from '../assets/colourful-grad.webp';
import ProductCarousel from '../components/ProductCarousel';
import p1 from '../assets/p-11.webp';
import p2 from '../assets/p-22.webp';
import p3 from '../assets/p-33.webp';
import p4 from '../assets/p-44.webp';

const DEFAULT_IMAGES = { 'p-1': p1, 'p-2': p2, 'p-3': p3, 'p-4': p4 };
const isValidImageUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');

function CartItemImage({ item }) {
  const [imgError, setImgError] = useState(false);
  const src = isValidImageUrl(item.image) && !imgError ? item.image : (DEFAULT_IMAGES[item.id] || p1);
  return <img src={src} alt={item.name} loading="lazy" decoding="async" onError={() => setImgError(true)} />;
}

export default function Buy() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, shippingCharge, shippingLoading, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isEmpty = items.length === 0;

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  }

  return (
    <div className="buy-page">
      <section className="buy-hero" style={{ backgroundImage: `url(${colourfulGrad})` }}>
        <div className="buy-hero-left">
          <h1 className="buy-hero-title">Buy Now</h1>
          <p className="buy-hero-subtitle">Ready to order? Let's get you started.</p>
        </div>

        <div className="buy-hero-right">
        </div>
      </section>

      <ProductCarousel
        withAos={true}
        sectionStyle={{ padding: '2rem 0', backgroundColor: 'transparent' }}
        wrapperStyle={{ maxWidth: '1240px', margin: '0 auto', padding: '0' }}
      />

      {/* ── Cart Section ── */}
      <section className="buy-cart-section">
        <div className="buy-cart-inner">
          <h2 className="buy-cart-title">Your Cart</h2>

          {isEmpty ? (
            <div className="buy-cart-empty">
              <div className="buy-cart-empty-inner">
                <svg className="buy-cart-empty-icon" width="64" height="64" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 0C27.9411 0 36 8.05887 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0ZM14.1074 27.0068C13.3272 27.0068 12.6934 27.6407 12.6934 28.4209C12.6934 29.2011 13.3272 29.835 14.1074 29.835C14.8876 29.8349 15.5215 29.2011 15.5215 28.4209C15.5215 27.6407 14.8876 27.0069 14.1074 27.0068ZM22.5488 27.0068C21.7686 27.0068 21.1338 27.6407 21.1338 28.4209C21.1338 29.2011 21.7686 29.835 22.5488 29.835C23.3289 29.8348 23.9629 29.201 23.9629 28.4209C23.9629 27.6408 23.3289 27.007 22.5488 27.0068ZM6.98926 10.0332L9.13379 10.8545L9.7998 13.3369C9.79983 13.3915 9.80471 13.4464 9.81836 13.501L12.1777 22.2295L10.5488 23.6299L10.5029 23.6758C10.0923 24.0864 10.0014 24.7249 10.2295 25.2725C10.4576 25.8199 11.0046 26.1396 11.5977 26.1396H26.1074V24.7705H11.5977C11.5673 24.7704 11.5372 24.7549 11.5068 24.7246V24.6338L13.2637 23.1279H26.1533C26.5182 23.1278 26.7922 22.9 26.8379 22.5352L28.4346 13.4092C28.4801 13.2269 28.4344 12.9992 28.2979 12.8623C28.161 12.7254 27.9781 12.6338 27.75 12.6338H11.0371L10.3662 10.1699C10.3206 9.98741 10.1832 9.80512 9.95508 9.71387L7.49121 8.70996L6.98926 10.0332ZM25.5596 21.7139H13.5146L11.4609 14.0029H26.8828L25.5596 21.7139ZM15.4307 20.0254H23.2783V18.6113H15.4307V20.0254ZM14.5635 17.1504H23.9629V15.7363H14.5635V17.1504Z" fill="#ccc" />
                </svg>
                <p className="buy-cart-empty-text">Your cart feels a bit light.</p>
                <p className="buy-cart-empty-hint">Add products from the carousel above to get started.</p>
              </div>
            </div>
          ) : (
            <div className="buy-cart-content">
              <div className="buy-cart-items-list">
                {items.map((item) => (
                  <div className="buy-cart-item" key={item.id}>
                    <div className="buy-cart-item-image">
                      <CartItemImage item={item} />
                    </div>
                    <div className="buy-cart-item-info">
                      <h3 className="buy-cart-item-name">{item.name}</h3>
                      <p className="buy-cart-item-desc">{item.description}</p>
                      <p className="buy-cart-item-price">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="buy-cart-item-controls">
                      <div className="buy-cart-qty-control">
                        <button
                          className="buy-cart-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          id={`buy-qty-minus-${item.id}`}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="buy-cart-qty-value">{item.quantity}</span>
                        <button
                          className="buy-cart-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          id={`buy-qty-plus-${item.id}`}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <button
                        className="buy-cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        id={`buy-remove-${item.id}`}
                        aria-label="Remove item"
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="buy-cart-summary">
                <h3 className="buy-cart-summary-title">Order Summary</h3>
                <div className="buy-cart-summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="buy-cart-summary-row">
                  <span>Shipping</span>
                  <span>{shippingLoading ? '...' : `₹${shippingCharge.toFixed(2)}`}</span>
                </div>
                <div className="buy-cart-summary-divider"></div>
                <div className="buy-cart-summary-row buy-cart-summary-total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <button className="buy-cart-checkout-btn" onClick={handleCheckout} id="buy-cart-checkout">
                  CHECKOUT
                </button>
                <button className="buy-cart-clear-btn" onClick={clearCart} id="buy-cart-clear">
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
