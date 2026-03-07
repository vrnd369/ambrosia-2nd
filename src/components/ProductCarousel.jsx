import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DEFAULT_PRODUCTS, useCart } from '../context/CartContext';
import p1 from '../assets/p-11.webp';
import p2 from '../assets/p-22.webp';
import p3 from '../assets/p-33.webp';
import p4 from '../assets/p-44.webp';

const DEFAULT_IMAGES = { 'p-1': p1, 'p-2': p2, 'p-3': p3, 'p-4': p4 };

const isValidImageUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');

function ProductImage({ product }) {
  const [imgError, setImgError] = useState(false);
  const primary = product.image || product.image_url;
  const src = isValidImageUrl(primary) && !imgError ? primary : (DEFAULT_IMAGES[product.id] || p1);
  return (
    <img
      src={src}
      alt={product.name}
      draggable="false"
      loading="lazy"
      decoding="async"
      onError={() => setImgError(true)}
    />
  );
}

/**
 * Shared product carousel used by both SectionNine (home) and Buy page.
 * Displays cards that scale to fill the viewport width.
 * If the number of products exceeds what fits on screen, carousel navigation is enabled.
 */
export default function ProductCarousel({ withAos = false, wrapperStyle = {}, sectionStyle = {} }) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const { addToCart, updateQuantity, items, products } = useCart();
  const displayProducts = products?.length > 0 ? products : DEFAULT_PRODUCTS;

  // Track "just added" animation per product
  const [justAdded, setJustAdded] = useState({});

  // Carousel state
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(4);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);

  // Calculate how many slides are visible based on viewport width
  const calcVisibleSlides = useCallback(() => {
    if (!viewportRef.current) return 4;
    const viewportWidth = viewportRef.current.offsetWidth;
    if (viewportWidth <= 480) return 1;
    if (viewportWidth <= 640) return 2;
    if (viewportWidth <= 900) return 3;
    return 4;
  }, []);

  // Recalculate visible slides on resize
  useEffect(() => {
    const onResize = () => {
      const newVisible = calcVisibleSlides();
      setVisibleSlides(newVisible);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [calcVisibleSlides]);

  // Determine if carousel is needed
  const totalSlides = displayProducts.length;
  const needsCarousel = totalSlides > visibleSlides;
  const maxIndex = needsCarousel ? totalSlides - visibleSlides : 0;

  // Clamp slideIndex when visibleSlides or totalSlides change
  useEffect(() => {
    setSlideIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  // Apply translateX when slideIndex changes
  useEffect(() => {
    if (!trackRef.current || !viewportRef.current) return;
    const viewportWidth = viewportRef.current.offsetWidth;
    const gap = 20; // match CSS gap
    const slideWidth = (viewportWidth - gap * (visibleSlides - 1)) / visibleSlides;
    const offset = slideIndex * (slideWidth + gap);
    trackRef.current.style.transform = `translateX(-${offset}px)`;
  }, [slideIndex, visibleSlides]);

  const goPrev = useCallback(() => {
    setSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex(prev => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  // --- Touch / pointer handlers (swipe on mobile, drag on desktop) ---
  const handleTouchStart = useCallback((e) => {
    isDragging.current = true;
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    touchDeltaX.current = 0;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || !trackRef.current || !viewportRef.current) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    touchDeltaX.current = currentX - touchStartX.current;
    const viewportWidth = viewportRef.current.offsetWidth;
    const gap = 20;
    const slideWidth = (viewportWidth - gap * (visibleSlides - 1)) / visibleSlides;
    const base = -(slideIndex * (slideWidth + gap));
    trackRef.current.style.transform = `translateX(${base + touchDeltaX.current}px)`;
  }, [slideIndex, visibleSlides]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
    const threshold = 50;
    if (touchDeltaX.current < -threshold) {
      goNext();
    } else if (touchDeltaX.current > threshold) {
      goPrev();
    } else {
      // Snap back
      if (trackRef.current && viewportRef.current) {
        const viewportWidth = viewportRef.current.offsetWidth;
        const gap = 20;
        const slideWidth = (viewportWidth - gap * (visibleSlides - 1)) / visibleSlides;
        const offset = slideIndex * (slideWidth + gap);
        trackRef.current.style.transform = `translateX(-${offset}px)`;
      }
    }
  }, [goNext, goPrev, slideIndex, visibleSlides]);

  const handleAddToCart = product => {
    addToCart(product);
    setJustAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setJustAdded(prev => ({ ...prev, [product.id]: false }));
    }, 800);
  };

  // Get quantity of a product already in cart
  const getQuantity = productId => {
    const item = items.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  // Dot indicators: one dot per possible position
  const dotCount = needsCarousel ? maxIndex + 1 : 0;

  return (
    <div className="buy-carousel-section" style={sectionStyle}>
      <div className="buy-carousel-wrapper" style={wrapperStyle}>
        {/* Left arrow - only show if carousel is needed */}
        {needsCarousel && (
          <button
            className="buy-carousel-btn buy-carousel-btn--left"
            onClick={goPrev}
            disabled={slideIndex === 0}
            aria-label="Previous product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div
          className="buy-carousel-viewport"
          ref={viewportRef}
          onTouchStart={needsCarousel ? handleTouchStart : undefined}
          onTouchMove={needsCarousel ? handleTouchMove : undefined}
          onTouchEnd={needsCarousel ? handleTouchEnd : undefined}
          onMouseDown={needsCarousel ? handleTouchStart : undefined}
          onMouseMove={needsCarousel ? handleTouchMove : undefined}
          onMouseUp={needsCarousel ? handleTouchEnd : undefined}
          onMouseLeave={needsCarousel ? handleTouchEnd : undefined}
          style={!needsCarousel ? { cursor: 'default' } : undefined}
        >
          <div
            className="buy-carousel-track"
            ref={trackRef}
            style={{
              // Each slide takes an equal fraction of the viewport
              '--visible-slides': visibleSlides,
            }}
          >
            {displayProducts.map((product, i) => {
              const qty = getQuantity(product.id);
              const isAdded = justAdded[product.id];

              const slideContent = (
                <>
                  <div className="buy-slide-image-wrap">
                    <ProductImage product={product} />
                  </div>
                  <div className="product-info">
                    <span className="product-name">{product.description}</span>
                    <span className="product-price">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="product-actions">
                    {qty > 0 && (
                      <div className="product-qty-control">
                        <button
                          className="product-qty-btn"
                          onClick={() => updateQuantity(product.id, qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="product-qty-value">{qty}</span>
                        <button
                          className="product-qty-btn"
                          onClick={() => updateQuantity(product.id, qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <button
                      className={`buy-add-to-cart ${isAdded ? 'buy-add-to-cart--added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      id={`add-to-cart-${product.id}`}
                    >
                      <svg
                        className="cart-icon"
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 0C27.9411 0 36 8.05887 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0ZM14.1074 27.0068C13.3272 27.0068 12.6934 27.6407 12.6934 28.4209C12.6934 29.2011 13.3272 29.835 14.1074 29.835C14.8876 29.8349 15.5215 29.2011 15.5215 28.4209C15.5215 27.6407 14.8876 27.0069 14.1074 27.0068ZM22.5488 27.0068C21.7686 27.0068 21.1338 27.6407 21.1338 28.4209C21.1338 29.2011 21.7686 29.835 22.5488 29.835C23.3289 29.8348 23.9629 29.201 23.9629 28.4209C23.9629 27.6408 23.3289 27.007 22.5488 27.0068ZM6.98926 10.0332L9.13379 10.8545L9.7998 13.3369C9.79983 13.3915 9.80471 13.4464 9.81836 13.501L12.1777 22.2295L10.5488 23.6299L10.5029 23.6758C10.0923 24.0864 10.0014 24.7249 10.2295 25.2725C10.4576 25.8199 11.0046 26.1396 11.5977 26.1396H26.1074V24.7705H11.5977C11.5673 24.7704 11.5372 24.7549 11.5068 24.7246V24.6338L13.2637 23.1279H26.1533C26.5182 23.1278 26.7922 22.9 26.8379 22.5352L28.4346 13.4092C28.4801 13.2269 28.4344 12.9992 28.2979 12.8623C28.161 12.7254 27.9781 12.6338 27.75 12.6338H11.0371L10.3662 10.1699C10.3206 9.98741 10.1832 9.80512 9.95508 9.71387L7.49121 8.70996L6.98926 10.0332ZM25.5596 21.7139H13.5146L11.4609 14.0029H26.8828L25.5596 21.7139ZM15.4307 20.0254H23.2783V18.6113H15.4307V20.0254ZM14.5635 17.1504H23.9629V15.7363H14.5635V17.1504Z"
                          fill="#D9D9D9"
                        />
                      </svg>
                      {isAdded ? 'ADDED ✓' : 'ADD TO CART'}
                    </button>
                  </div>
                </>
              );

              return (
                <div className="buy-carousel-slide" key={product.id}>
                  {withAos ? (
                    <div
                      data-aos="fade-left"
                      data-aos-delay={i * 150}
                      data-aos-duration="1000"
                      data-aos-easing="ease-out-cubic"
                      data-aos-once="false"
                      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                      {slideContent}
                    </div>
                  ) : (
                    slideContent
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right arrow - only show if carousel is needed */}
        {needsCarousel && (
          <button
            className="buy-carousel-btn buy-carousel-btn--right"
            onClick={goNext}
            disabled={slideIndex >= maxIndex}
            aria-label="Next product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dot indicators - only show if carousel is needed */}
      {needsCarousel && dotCount > 1 && (
        <div className="buy-carousel-dots">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              className={`buy-carousel-dot ${i === slideIndex ? 'buy-carousel-dot--active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
