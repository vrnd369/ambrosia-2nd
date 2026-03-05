import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import cartIcon from '../assets/cart-icon.svg';

function SectionFour() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      // When the top of Section 4 reaches the viewport, switch to fixed
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top <= 0) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initially
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lazy-load the 22MB video only when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !videoLoaded) {
          setVideoLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [videoLoaded]);

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    const phoneNumber = "9000179900";
    const message = encodeURIComponent("Hello, I'm interested in Ambrosia!");
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="s4-container" ref={sectionRef}>
      {videoLoaded && (
        <video ref={videoRef} className="s4-video-bg" autoPlay loop muted playsInline preload="none">
          <source src={new URL('../assets/product-teaser.mp4', import.meta.url).href} type="video/mp4" />
        </video>
      )}
      <div className="s4-content-card">
        {/* <img className='s4-logo' src={Logo} alt="ambrosia logo" /> */}
        <h3 className="s4-title">
          <span className="s4-title-script">Wondering what </span>
          <span className="s4-title-main">Ambrosia is?</span>
        </h3>
        <p className="s4-desc">
          Ambrosia is a botanical elixir rooted in ancient plant traditions and refined for modern life. It quiets the mental noise and steadies your pace without spiking or sedating you. You feel alert but calm, clear but unforced. No jitters. No crash. No haze the next day. Just clean, sustained clarity and a stillness you can feel.
        </p>
        <p className="s4-desc-bold">
          No caffeine. No alcohol.<br />
          Just you, but steadier.
        </p>
        <Link to="/about" className="s4-read-more-btn-new">Read more..</Link>
      </div>

      <div className={`s4-floating-wrapper ${isFixed ? 'fixed' : 'absolute'}`}>
        <a href="/buy" className="floating-shop-btn">
          <img src={cartIcon} alt="Cart" className="cart-icon" loading="lazy" decoding="async" />
          SHOP NOW
        </a>
        
        <a href="#" onClick={handleWhatsAppClick} className="floating-whatsapp" aria-label="Contact us on WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.6-12 1.9-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.8-27.6-33.1-30.8-38.7-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.5-9.3 1.9-3.7.9-7-5-12.5-5.6-5.6-12.5-31.1-17.1-42.6-4.5-11.1-9.1-9.6-12.5-9.8-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </a>
      </div>
    </section>
  );
}

export default SectionFour;
