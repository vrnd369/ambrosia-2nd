import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';
import colourfulGradient from '../assets/colourful-gradient.webp';
import twoCan from '../assets/two-can.webp';
import circleOverlay from '../assets/circle-overlay.webp';
import Why1 from '../assets/why-1.webp';
import Why2 from '../assets/why-2.webp';
import Why3 from '../assets/why-3.webp';
import Why4 from '../assets/why-4.webp';

export default function About() {
  const parallaxRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      parallaxRefs.current.forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
        const translateY = (clampedProgress - 0.5) * -100;
        el.style.transform = `translateY(${translateY}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setParallaxRef = index => el => {
    parallaxRefs.current[index] = el;
  };

  return (
    <div className="about-page">
      {/* 1. Hero Container - matching SectionThree layout & assets */}
      <section className="about-hero" style={{ backgroundImage: `url(${colourfulGradient})` }}>
        <div className="about-hero-left" data-aos="fade-right" data-aos-once="false">
          <h1 className="heroTitle">
            <span className="heroLine">Why Ambrosia</span>
            <span className="heroLine about-hero-subtitle">Balance begins with what you sip.</span>
          </h1>
          <button className="s3-buy-btn" onClick={() => navigate('/buy')}>
            {/* <svg
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
            </svg> */}
            Shop Now
          </button>
        </div>

        <div className="about-hero-right">
          <img loading="lazy" src={circleOverlay} alt="Overlay" className="circle-overlay" />
          <div className="two-cans-wrapper" data-aos="fade-left" data-aos-once="false">
            <img loading="lazy" src={twoCan} alt="Two Cans" className="two-cans" />
          </div>
        </div>
      </section>

      {/* 2. Why Ambrosia Blocks */}
      <div className="why-blocks-wrapper">
        {/* Block 1: Our Story */}
        <section className="why-section why-bg-dark">
          <div className="why-block-container">
            <div className="why-block why-block--left">
              <div className="why-block__content" data-aos="fade-right">
                <h2 className="why-block__title">
                  Our <span>Story</span>
                </h2>
                <ul className="why-block__list">
                  <li>We're not here to ruin your fun. Really.</li>
                  <li>We're not judging your weekends.</li>
                  <li>
                    We're not anti-party. We're not trying to be the "better than" option. We just believe you
                    should have choices.
                  </li>
                  <li>Because sometimes you want to feel amazing, </li>
                  <li>without waking up feeling like a trash panda who made questionable life decisions.</li>
                  <li>
                    Sometimes you want to be social, relaxed, funny, present ... and still wake up clear.
                  </li>
                  <li>
                    <strong>That's where Ambrosia comes in.</strong>
                  </li>
                </ul>
              </div>
              <div className="why-block__image" ref={setParallaxRef(0)}>
                <img
                  loading="lazy"
                  src={Why1}
                  className="why-img-1"
                  alt="Our Story - celestial illustration"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Block 2: What Ambrosia is... */}
        <section className="why-section why-bg-light">
          <div className="why-block-container container-2">
            <div className="why-block why-block--right">
              <div className="why-block__image" ref={setParallaxRef(1)}>
                <img
                  loading="lazy"
                  src={Why2}
                  className="why-img-2"
                  alt="What Ambrosia is - colorful illustration"
                />
              </div>
              <div className="why-block__content content-2" data-aos="fade-left">
                <h2 className="why-block__title t-2">
                  What <span> Ambrosia is...</span>
                </h2>
                <p className="why-block__text">
                  Ambrosia is a botanical drink crafted to help you feel calm, clear, and steady without
                  relying on alcohol or overstimulation. Made with adaptogenic plants. It supports your body's
                  natural balance instead of pushing it to extremes. No buzz to chase, no crash to recover
                  from just smooth, grounded energy that lets you show up fully, whether you're working,
                  creating, or staying out a little later than usual.
                </p>
                <p
                  className="why-block__bold"
                  style={{
                    color: '#000',
                    marginTop: '1.6rem',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-main)',
                  }}
                >
                  Simply supHERB.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Block 3: What Ambrosia isn't... */}
        <section className="why-section why-bg-dark">
          <div className="why-block-container container-3">
            <div className="why-block why-block--left">
              <div className="why-block__content" data-aos="fade-right">
                <h2 className="why-block__title t-3">
                  What <span>Ambrosia isn't...</span>
                </h2>
                <ul className="why-block__list list-2">
                  <li>We're not the fun police.</li>
                  <li>We're not saying don't drink.</li>
                  <li>We're not saying you've been doing it wrong.</li>
                  <li>We're just asking:</li>
                  <li>What if feeling good didn't have to come with regret?</li>
                  <li>What if you could enjoy the night and the morning?</li>
                  <li>What if "calm" wasn't boring - just powerful?</li>
                  <li>Ambrosia is for the nights you want to remember.</li>
                  <li>The mornings you want to enjoy.</li>
                  <li>And the version of you that doesn't need chaos to feel alive.</li>
                </ul>
                <p className="why-block__bold">
                  That's <span className="why"> why it is </span>{' '}
                  <span className="nfy-highlight">NOT FOR YOU.</span>
                </p>
              </div>
              <div className="why-block__image" ref={setParallaxRef(2)}>
                <img
                  loading="lazy"
                  src={Why3}
                  className="why-img-3"
                  alt="What Ambrosia isn't - bull mascot"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Block 4: Clean Ingredients */}
        <section className="why-section why-bg-light section-4">
          <div className="why-block-container container-4">
            <div className="why-block why-block-center" data-aos="fade-up">
              <div
                className="why-block__content"
                style={{ textAlign: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}
              >
                <h2 className="why-block__title t-4">
                  <span>Clean </span>Ingredients
                </h2>
                <ul className="why-block__list">
                  <li>We believe you should know exactly what you're drinking.</li>
                  <li>That's why everything is on the label clearly and complete.</li>
                  <li>Proprietary blend, No hidden fillers, no asterisks leading to fine print.</li>
                  <li>Just real, recognizable botanicals, and other time-tested adaptogens.</li>
                  <li>No shortcuts. No chemical smoke screens.</li>
                </ul>
                <p
                  className="why-block__text"
                  style={{ fontSize: '1.5rem', marginTop: '1.5rem', fontWeight: 500 }}
                >
                  {' '}
                  Just plants, water, and good intentions.
                  <br />
                  That's it. That's the list.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Block 5: How does the botanical drinks work? */}
        <section className="why-section why-bg-dark">
          <div className="why-block-container container-5">
            <div className="why-block why-block--right">
              <div className="why-block__image image-4" ref={setParallaxRef(3)}>
                <img
                  loading="lazy"
                  src={Why4}
                  className="why-img-4"
                  alt="How does it work - spinning top"
                />
              </div>
              <div className="why-block__content" data-aos="fade-left">
                <h2 className="why-block__title t-5">
                  How does
                  <br />
                  <span>the botanical drinks work?</span>
                </h2>
                <ul className="why-block__list">
                  <li>Ambrosia works with your body not against it.</li>

                  <li>
                    Instead of spiking your system with stimulants or numbing it with alcohol, we use
                    adaptogenic botanicals like ashwagandha, spikenard, and passionflower to help your body
                    respond to stress more smoothly.
                  </li>
                  <br />

                  <li>
                    It's not about forcing you "up" or dragging you "down." It's about helping you stay
                    balanced so you can feel social, sharp, and fully yourself.
                  </li>

                  <li>Because feeling good shouldn't come with a consequence.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* <section className="info-block" style={{ marginBottom: '8rem' }}>
        <div className="info-content">
          <h2 className="info-title">
            Why <span>Ambrosia?</span>
          </h2>
          <p className="info-text">
            It has Indian botanical herbs that have been found in India for ages. These superfoods are
            timeless and have proven scientific results. If we cannot pronounce it, it will not be on the can.
            No weird chemicals, no pretense of natural flavors. That's why it is not a cup of tea for
            everyone, that's why it is NOT FOR YOU.
          </p>
        </div>
        <div className="info-image">
          <div className="info-img-wrapper"></div>
        </div>
      </section> */}
    </div>
  );
}
