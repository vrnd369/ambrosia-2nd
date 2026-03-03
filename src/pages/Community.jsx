import React, { useEffect, useRef } from 'react';
import './Community.css';
import './About.css';
import communityBg from '../assets/community.png';
import community1 from '../assets/community-1.png';
import community2 from '../assets/community-2.png';
import communityGroup from '../assets/community-group.png';

export default function Community() {
  const parallaxRefs = useRef([]);

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
    <div className="community-page">
      {/* 1. Hero Container - matching About layout & assets */}
      <section className="community-hero" style={{ backgroundImage: `url(${communityBg})` }}>
        <div className="community-hero-left" data-aos="fade-right" data-aos-once="false">
          <h1 className="community-hero-title">
            <span className="community-the">The</span>
            <span>Ambroooooosians</span>
            <span className="community-subtitle">This isn't for everyone.</span>
          </h1>
        </div>
        <div className="community-hero-right" data-aos="fade-left" data-aos-once="false">
          <img loading="lazy" src={communityGroup} alt="Ambroooooosians Community" className="community-group-img" />
        </div>
      </section>

      {/* 2 & 3. Replaced with pattern from About.jsx */}
      <div className="why-blocks-wrapper">
        {/* Block 1: A Better Way to Feel */}
        <section className="why-section why-bg-light">
          <div className="why-block-container container-5">
            <div className="why-block why-block--right">
              <div className="why-block__image" ref={setParallaxRef(0)}>
                <img loading="lazy" src={community1} style={{ width: '270px' }} alt="Peace Hand" />
              </div>
              <div className="why-block__content content-2" data-aos="fade-left">
                <h2 className="why-block__title t-4">
                  A Better Way to <span>Feel.</span>
                </h2>
                <ul className="why-block__list">
                  <li>
                    Imagine your brain finally being on your side. The fog lifts, the background anxiety
                    softens, and your thoughts stop competing for attention. You feel calm, clear, and locked
                    in not wired or overstimulated, just steady.
                  </li>

                  <li>
                    It's like the volume on the noise gets turned down and your focus is handed back to you.
                  </li>

                  <li>No jitters. No crash. No fake energy that disappears in a few hours.</li>

                  <li>
                    Just smooth, grounded momentum that feels natural because it is. The kind that carries you
                    through deep work, creative flow, or walking into a room without feeling like you have
                    anything to prove. Because you don't.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Block 2: Who is it for? */}
        <section className="why-section why-bg-dark">
          <div className="why-block-container">
            <div className="why-block why-block--left">
              <div className="why-block__content" data-aos="fade-right">
                <h2 className="why-block__title t-3">
                  <span
                    className="why"
                    style={{
                      fontFamily: 'var(--font-stylish)',
                      fontSize: '2.5rem',
                      fontWeight: 400,
                      color: '#000',
                    }}
                  >
                    Who
                  </span>{' '}
                  <span>is it for?</span>
                </h2>
                <ul className="why-block__list list-2">
                  <li>The 3 a.m. creative sprint people.</li>
                  <li>The "one more coffee might actually be a mistake" crowd.</li>
                  <li>The ones who want to be social tonight ... and still feel like themselves tomorrow.</li>
                  <li>If you've ever felt like you had to choose </li>
                  <li>between fun and functionality, </li>
                  <li>between showing up and feeling good, </li>
                  <li>between staying out and staying steady, </li>
                  <li>You're not alone.</li>
                  <li>And you're not asking for too much.</li>
                  <li>If you're tired of that trade-off.</li>
                </ul>
              </div>
              <div className="why-block__image" ref={setParallaxRef(1)}>
                <img loading="lazy" src={community2} style={{ width: '330px' }} alt="Butterfly" />
              </div>
            </div>
          </div>
        </section>

        {/* You Found Your People */}
        <section className="why-section why-bg-dark" style={{ paddingTop: '0', paddingBottom: '5rem' }}>
          <h2 className="community-highlight-row justify-center">
            <span className="community-script__title">You</span>
            <span className="community-script__stylish">Found</span>
            <span className="community-script__title">Your</span>
            <span className="community-script__stylish">People</span>
          </h2>
        </section>
      </div>

      {/* 4. Social Feed */}
      <section className="community-feed-section">
        <h2 className="community-highlight-row justify-center">
          <h2 className="community-block__title t-6">
            Social <span>Feed</span>
          </h2>
        </h2>

        <div className="community-feed-grid">
          <div className="community-feed-item" data-aos="fade-left" data-aos-delay="0" data-aos-duration="1000" data-aos-easing="ease-out-cubic" data-aos-once="false"></div>
          <div className="community-feed-item" data-aos="fade-left" data-aos-delay="150" data-aos-duration="1000" data-aos-easing="ease-out-cubic" data-aos-once="false"></div>
          <div className="community-feed-item" data-aos="fade-left" data-aos-delay="300" data-aos-duration="1000" data-aos-easing="ease-out-cubic" data-aos-once="false"></div>
          <div className="community-feed-item" data-aos="fade-left" data-aos-delay="450" data-aos-duration="1000" data-aos-easing="ease-out-cubic" data-aos-once="false"></div>
        </div>
      </section>
    </div>
  );
}
