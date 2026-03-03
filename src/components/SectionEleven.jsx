import { useState, useRef, useEffect, useCallback } from 'react';
const reviews = [
  {
    tagline: 'life changing.',
    desc: 'i love everything about these drinks. i quit alcohol cold turkey and my wife decided to join me... i turned her onto hiyo and she fell in love. to know that i have a sober support system and an alternative to something that’s done no good for me, hiyos are truly a godsend.',
    rating: 4.5,
  },
  {
    tagline: 'life changing.',
    desc: 'i love everything about these drinks. i quit alcohol cold turkey and my wife decided to join me... i turned her onto hiyo and she fell in love. to know that i have a sober support system and an alternative to something that’s done no good for me, hiyos are truly a godsend.',
    rating: 4.5,
  },
  {
    tagline: 'life changing.',
    desc: 'i love everything about these drinks. i quit alcohol cold turkey and my wife decided to join me... i turned her onto hiyo and she fell in love. to know that i have a sober support system and an alternative to something that’s done no good for me, hiyos are truly a godsend.',
    rating: 4.5,
  },
  {
    tagline: 'life changing.',
    desc: 'i love everything about these drinks. i quit alcohol cold turkey and my wife decided to join me... i turned her onto hiyo and she fell in love. to know that i have a sober support system and an alternative to something that’s done no good for me, hiyos are truly a godsend.',
    rating: 4.5,
  },
  {
    tagline: 'life changing.',
    desc: 'i love everything about these drinks. i quit alcohol cold turkey and my wife decided to join me... i turned her onto hiyo and she fell in love. to know that i have a sober support system and an alternative to something that’s done no good for me, hiyos are truly a godsend.',
    rating: 4.5,
  },
  {
    tagline: 'life changing.',
    desc: 'i love everything about these drinks. i quit alcohol cold turkey and my wife decided to join me... i turned her onto hiyo and she fell in love. to know that i have a sober support system and an alternative to something that’s done no good for me, hiyos are truly a godsend.',
    rating: 4.5,
  },
];

function SectionEleven() {
  const [current, setCurrent] = useState(0);

  const trackRef = useRef(null);
  const viewportRef = useRef(null);

  const getCardsVisible = useCallback(() => {
    if (typeof window === 'undefined') return 2.5;
    if (window.innerWidth <= 480) return 1.2;
    if (window.innerWidth <= 768) return 1.8;
    if (window.innerWidth <= 1024) return 2.5;
    return 2.5;
  }, []);

  const getMaxIndex = useCallback(() => {
    return Math.max(0, reviews.length - 1);
  }, []);

  const dotsCount = reviews.length;

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(getMaxIndex(), c + 1));

  const updatePosition = useCallback(() => {
    if (!trackRef.current || !viewportRef.current) return;

    const trackStyles = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(trackStyles.gap) || 0;

    const firstCard = trackRef.current.firstElementChild;
    const cardWidth = firstCard ? firstCard.offsetWidth : 0;

    if (cardWidth === 0) return;

    const targetOffset = current * (cardWidth + gap);

    trackRef.current.style.transform = `translateX(-${targetOffset}px)`;
  }, [current]);

  // ✅ update when slide changes
  useEffect(() => {
    updatePosition();
  }, [current, updatePosition]);

  // ✅ resize listener (no setState inside effect)
  useEffect(() => {
    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [updatePosition]);

  return (
    <section className="section-carousel section-11-carousel section-eleven">
      <h2 className="carousel-tagline">
        <span className="tagline-first">The</span> <span>People Have Spoken</span>
      </h2>

      <div className="s11-carousel-wrapper">
        {current > 0 && (
          <button
            type="button"
            className="carousel-btn s11-carousel-btn s11-carousel-btn--left"
            onClick={prev}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="s11-carousel-viewport" ref={viewportRef}>
          <div className="s11-carousel-track" ref={trackRef}>
            {reviews.map((review, i) => (
              <div className="s11-carousel-slide" key={i}>
                <div className="s11-card" style={{ backgroundColor: '#D9D6BC' }}>
                  <div className="s11-card-content">
                    <div>
                      <h3 className="s11-card-tagline">{review.tagline}</h3>
                      <p className="s11-card-desc">{review.desc}</p>
                    </div>
                    <div className="s11-card-rating">
                      <svg viewBox="0 0 24 24" fill="#f57621">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" fill="#f57621">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" fill="#f57621">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" fill="#f57621">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" fill="transparent" stroke="#B0B0B0" strokeWidth="1">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {current < getMaxIndex() && (
          <button
            type="button"
            className="carousel-btn s11-carousel-btn s11-carousel-btn--right"
            onClick={next}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {dotsCount > 0 && (
        <div className="s11-carousel-dots">
          {Array.from({ length: dotsCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`s11-carousel-dot ${
                Math.min(current, getMaxIndex()) === idx ? 's11-carousel-dot--active' : ''
              }`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default SectionEleven;
