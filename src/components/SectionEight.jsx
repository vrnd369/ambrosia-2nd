import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s8Left from '../assets/s-8-left.webp';
import s8Right from '../assets/s-8-right.webp';

gsap.registerPlugin(ScrollTrigger);

function SectionEight() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { y: 80 },
        {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-eight split-layout" ref={sectionRef}>
      <div className="s8-left" data-aos="fade-right">
        <img src={s8Left} alt="What's Not Inside Left" className="s8-bg" loading="lazy" decoding="async" />

        <div className="s8-content-container" ref={textRef}>
          <div className="s8-title">
            <span className="s8-title-script">What's</span>
            <span className="s8-title-main">Not Inside</span>
          </div>

          <div className="s8-list-container">
            <div className="s8-list-item">
              <span className="s8-list-text">Alcohol.</span>
              <div className="s8-strike-line"></div>
            </div>
            <div className="s8-list-item">
              <span className="s8-list-text">Caffeine.</span>
              <div className="s8-strike-line"></div>
            </div>
            <div className="s8-list-item">
              <span className="s8-list-text">Regret.</span>
              <div className="s8-strike-line"></div>
            </div>
            <div className="s8-list-item">
              <span className="s8-list-text">Drama.</span>
              <div className="s8-strike-line"></div>
            </div>
          </div>

          <div className="s8-subtitle">The usual suspects.</div>
        </div>
      </div>

      <div className="s8-right" data-aos="fade-left" data-aos-once="false">
        <img src={s8Right} alt="What's Not Inside Right" className="s8-bg" loading="lazy" decoding="async" />
      </div>
    </section>
  );
}

export default SectionEight;
