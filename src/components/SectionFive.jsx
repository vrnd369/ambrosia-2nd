import { useState, useRef, useEffect, useCallback } from 'react';
import i1 from '../assets/i-1.webp';
import i2 from '../assets/i-2.webp';
import i3 from '../assets/i-3.webp';
import i4 from '../assets/i-4.webp';
import i5 from '../assets/i-5.webp';
import i6 from '../assets/i-6.webp';
import i7 from '../assets/i-7.webp';
import i8 from '../assets/i-8.webp';

const ingredients = [
  {
    img: i1,
    title: 'Ashwagandha',
    desc: 'Traditionally used to help the body manage stress. May support balanced cortisol levels and overall resilience.',
  },
  {
    img: i2,
    title: 'Spikenard',
    desc: 'An ancient grounding herb long used in meditation practices. Helps promote mental clarity and centered focus.',
  },
  {
    img: i3,
    title: 'Passionflower',
    desc: 'Traditionally used to ease nervous tension. May support relaxation and restful sleep without heavy sedation.',
  },
  {
    img: i4,
    title: 'Spikenard',
    desc: 'An ancient grounding herb long used in meditation practices. Helps promote mental clarity and centered focus.',
  },
  {
    img: i5,
    title: 'L-Theanine',
    desc: 'A naturally occurring amino acid found in tea. Supports relaxed focus without caffeine stimulation.',
  },
  {
    img: i6,
    title: 'Kava',
    desc: 'Traditionally used in Pacific cultures to promote relaxation and social ease. Supports muscle relaxation and a calm mood.',
  },
  {
    img: i7,
    title: 'Rhodiola',
    desc: 'An adaptogenic root traditionally used to help the body adapt to stress. May support stamina and mental performance during demanding periods.',
  },
  {
    img: i8,
    title: 'Lemon Balm',
    desc: 'A calming herb traditionally used for nervous tension and digestive comfort. Supports mood balance and gentle relaxation.',
  },
];

function SectionFive() {
  const [current, setCurrent] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);

  // Touch state refs (refs to avoid re-renders during drag)
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);
  const dragOffset = useRef(0);

  const getCardsVisible = useCallback(() => {
    if (typeof window === 'undefined') return 3.5;
    const w = window.innerWidth;
    if (w <= 480) return 1.2;
    if (w <= 768) return 1.8;
    if (w <= 1024) return 2.5;
    return 3.5;
  }, []);

  const getGap = useCallback(() => {
    if (typeof window === 'undefined') return 50;
    const w = window.innerWidth;
    if (w <= 480) return 12;
    if (w <= 768) return 16;
    return 50;
  }, []);

  const getMaxIndex = useCallback(() => {
    const visible = getCardsVisible();
    // Don't allow scrolling past the point where the last card is visible
    return Math.max(0, ingredients.length - Math.floor(visible));
  }, [getCardsVisible]);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(getMaxIndex(), c + 1));

  const getCardWidth = useCallback(() => {
    if (!viewportRef.current) return 0;
    const viewportWidth = viewportRef.current.offsetWidth;
    const visible = getCardsVisible();
    const gap = getGap();
    return (viewportWidth - gap * (visible - 1)) / visible;
  }, [getCardsVisible, getGap]);

  const getTranslateX = useCallback(
    (index) => {
      const cardWidth = getCardWidth();
      const gap = getGap();
      const offset = index * (cardWidth + gap);
      // Max offset so the last card group fits exactly
      const viewportWidth = viewportRef.current
        ? viewportRef.current.offsetWidth
        : 0;
      const totalTrackWidth =
        ingredients.length * cardWidth + (ingredients.length - 1) * gap;
      const maxOffset = Math.max(0, totalTrackWidth - viewportWidth);
      return Math.min(offset, maxOffset);
    },
    [getCardWidth, getGap]
  );

  const updatePosition = useCallback(
    (extraOffset = 0) => {
      if (!trackRef.current || !viewportRef.current) return;

      const cardWidth = getCardWidth();

      // Apply width to slides
      const slides = trackRef.current.children;
      for (let slide of slides) {
        slide.style.width = `${cardWidth}px`;
      }

      const safeCurrent = Math.min(current, getMaxIndex());
      const offset = getTranslateX(safeCurrent);

      trackRef.current.style.transform = `translateX(-${offset - extraOffset}px)`;
    },
    [current, getCardWidth, getMaxIndex, getTranslateX]
  );

  // --- Touch / swipe handlers ---
  const handleTouchStart = useCallback(
    (e) => {
      isDragging.current = true;
      touchStartX.current = e.touches[0].clientX;
      touchCurrentX.current = e.touches[0].clientX;
      dragOffset.current = 0;

      // Remove transition during drag for instant feedback
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
      }
    },
    []
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      touchCurrentX.current = e.touches[0].clientX;
      dragOffset.current = touchCurrentX.current - touchStartX.current;
      updatePosition(dragOffset.current);
    },
    [updatePosition]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Restore transition
    if (trackRef.current) {
      trackRef.current.style.transition =
        'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    const cardWidth = getCardWidth();
    const swipeThreshold = cardWidth * 0.25; // 25% of card width

    if (dragOffset.current < -swipeThreshold) {
      // Swiped left → next
      setCurrent((c) => Math.min(getMaxIndex(), c + 1));
    } else if (dragOffset.current > swipeThreshold) {
      // Swiped right → prev
      setCurrent((c) => Math.max(0, c - 1));
    } else {
      // Snap back
      updatePosition(0);
    }
    dragOffset.current = 0;
  }, [getCardWidth, getMaxIndex, updatePosition]);

  // Update on current change & resize
  useEffect(() => {
    // Ensure transition is set when current changes (not during drag)
    if (trackRef.current && !isDragging.current) {
      trackRef.current.style.transition =
        'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    }
    updatePosition();

    const handleResize = () => {
      // Clamp current on resize in case visible cards changed
      setCurrent((c) => Math.min(c, getMaxIndex()));
      updatePosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [current, updatePosition, getMaxIndex]);

  return (
    <section className="section-carousel section-five">
      <h2 className="carousel-tagline five-tagline">
        The{' '}
        <span className="hover-god">
          G<span>O</span>
          <span className="expandable-os">OOOOO</span>D
        </span>{' '}
        Stuff
      </h2>
      <div className="s5-carousel-wrapper">
        {current > 0 && (
          <button
            className="carousel-btn s5-carousel-btn s5-carousel-btn--left"
            onClick={prev}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#fff"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div
          className="s5-carousel-viewport"
          ref={viewportRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="s5-carousel-track" ref={trackRef}>
            {ingredients.map((item, i) => (
              <div className="s5-carousel-slide" key={i}>
                <div className="s5-image-wrapper">
                  <img src={item.img} alt={`Ingredient ${i + 1}`} loading="lazy" decoding="async" />
                </div>
                <div
                  className={`s5-card ${expandedIndex === i ? 'expanded' : ''}`}
                >
                  <h3 className="s5-card-title">{item.title}</h3>
                  <p className="s5-card-desc">
                    {expandedIndex === i
                      ? item.desc
                      : item.desc.split(' ').slice(0, 5).join(' ') + '...'}
                  </p>
                  <button
                    className="s5-card-toggle"
                    onClick={() =>
                      setExpandedIndex((prev) => (prev === i ? null : i))
                    }
                  >
                    {expandedIndex === i ? '−' : '+'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {current < getMaxIndex() && (
          <button
            className="carousel-btn s5-carousel-btn s5-carousel-btn--right"
            onClick={next}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="#fff"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="s5-carousel-dots">
        {ingredients.map((_, idx) => (
          <button
            key={idx}
            className={`s5-carousel-dot ${current === idx ? 's5-carousel-dot--active' : ''}`}
            onClick={() => setCurrent(Math.min(idx, getMaxIndex()))}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="s5-bottom-banner-container">
        <div className="s5-bottom-banner">
          <span className="banner-word">Ancient botanicals.</span>
          &nbsp;&nbsp;&nbsp;{' '}
          <span className="banner-word">Modern life.</span>
          &nbsp;&nbsp;&nbsp;{' '}
          <span className="banner-word">Zero compromise.</span>
        </div>
      </div>
    </section>
  );
}

export default SectionFive;
