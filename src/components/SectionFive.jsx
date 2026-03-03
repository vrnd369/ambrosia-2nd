import { useState, useRef, useEffect } from 'react';
import i1 from '../assets/i-1.png';
import i2 from '../assets/i-2.png';
import i3 from '../assets/i-3.png';
import i4 from '../assets/i-4.png';
import i5 from '../assets/i-5.png';
import i6 from '../assets/i-6.png';
import i7 from '../assets/i-7.png';
import i8 from '../assets/i-8.png';

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

  const getCardsVisible = () => {
    if (typeof window === 'undefined') return 3.5;
    if (window.innerWidth <= 480) return 1.2;
    if (window.innerWidth <= 768) return 1.8;
    if (window.innerWidth <= 1024) return 2.5;
    return 3.5;
  };

  // const getMaxIndex = () => Math.max(0, ingredients.length - Math.floor(getCardsVisible()));
  const getMaxIndex = () => ingredients.length - 1;

  // const prev = () => setCurrent(c => Math.max(0, c - 1));
  // const next = () => setCurrent(c => Math.min(getMaxIndex(), c + 1));

  const prev = () => {
    setCurrent(c => Math.max(0, c - 1));
  };

  const next = () => {
    setCurrent(c => Math.min(ingredients.length - 1, c + 1));
  };

  const updatePosition = () => {
    if (!trackRef.current || !viewportRef.current) return;

    const viewportWidth = viewportRef.current.offsetWidth;
    const visible = getCardsVisible();
    const gap = window.innerWidth <= 480 ? 12 : window.innerWidth <= 768 ? 16 : 50;

    const cardWidth = (viewportWidth - gap * (visible - 1)) / visible;

    // apply width to slides
    const slides = trackRef.current.children;
    for (let slide of slides) {
      slide.style.width = `${cardWidth}px`;
    }

    // ⭐ KEY FIX: clamp current safely
    const safeCurrent = Math.min(current, ingredients.length - 1);

    const offset = safeCurrent * (cardWidth + gap);
    const maxOffset = ingredients.length * (cardWidth + gap) - viewportWidth;

    // const finalOffset = Math.min(offset, maxOffset);

    // trackRef.current.style.transform = `translateX(-${finalOffset}px)`;

    trackRef.current.style.transform = `translateX(-${offset}px)`;
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [current]);

  return (
    <section className="section-carousel section-five">
      <h2 className="carousel-tagline five-tagline">
        The <span className="hover-god">G<span>O</span><span className="expandable-os">OOOOO</span>D</span> Stuff
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
        <div className="s5-carousel-viewport" ref={viewportRef}>
          <div className="s5-carousel-track" ref={trackRef}>
            {ingredients.map((item, i) => (
              <div className="s5-carousel-slide" key={i}>
                <div className="s5-image-wrapper">
                  <img src={item.img} alt={`Ingredient ${i + 1}`} />
                </div>
                <div className={`s5-card ${expandedIndex === i ? 'expanded' : ''}`}>
                  <h3 className="s5-card-title">{item.title}</h3>
                  <p className="s5-card-desc">
                    {expandedIndex === i ? item.desc : item.desc.split(' ').slice(0, 5).join(' ') + '...'}
                  </p>
                  <button
                    className="s5-card-toggle"
                    onClick={() => setExpandedIndex(prev => (prev === i ? null : i))}
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
            onClick={() => setCurrent(idx)}
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
