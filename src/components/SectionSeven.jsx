import React from 'react';
import s7Left from '../assets/s-7-left.webp';
import s7Right from '../assets/s-7-right.webp';
import focusIcon from '../assets/focus.webp';
import clarityIcon from '../assets/clarity.webp';
import calmnessIcon from '../assets/calmness.webp';
import stillnessIcon from '../assets/stillness.webp';

function SectionSeven() {
  return (
    <section className="section-seven split-layout">
      <div className="s7-left" data-aos="fade-right" data-aos-once="false">
        <img src={s7Left} alt="What's Inside Left" className="s7-bg" loading="lazy" />
      </div>

      <div className="s7-right" data-aos="fade-left" data-aos-once="false">
        <img src={s7Right} alt="What's Inside Right" className="s7-bg" loading="lazy" />

        <div className="s7-icons-container">
          <div className="s7-title">
            <span className="s7-title-script">What's</span>
            <span className="s7-title-main">Inside</span>
          </div>
          
          <div className="s7-icon-row">
            <img src={focusIcon} alt="Focus" loading="lazy" />
            <span className="s7-icon-text">Focus</span>
          </div>
          <div className="s7-icon-row">
            <img src={clarityIcon} alt="Clarity" loading="lazy" />
            <span className="s7-icon-text">Clarity</span>
          </div>
          <div className="s7-icon-row">
            <img src={calmnessIcon} alt="Calmness" loading="lazy" />
            <span className="s7-icon-text">Calmness</span>
          </div>
          <div className="s7-icon-row">
            <img src={stillnessIcon} alt="Stillness" loading="lazy" />
            <span className="s7-icon-text">Stillness</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionSeven;
