import React from 'react';
import s8Left from '../assets/s-8-left.webp';
import s8Right from '../assets/s-8-right.webp';

function SectionEight() {
  return (
    <section className="section-eight split-layout">
      <div className="s8-left" data-aos="fade-right" data-aos-once="false">
        <img src={s8Left} alt="What's Not Inside Left" className="s8-bg" loading="lazy" />
        
        <div className="s8-content-container">
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
          
          <div className="s8-subtitle">
            The usual suspects.
          </div>
        </div>
      </div>

      <div className="s8-right" data-aos="fade-left" data-aos-once="false">
        <img src={s8Right} alt="What's Not Inside Right" className="s8-bg" loading="lazy" />
      </div>
    </section>
  );
}

export default SectionEight;
