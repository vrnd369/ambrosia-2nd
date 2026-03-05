import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { fetchWithCoalescing, getCachedData, setCachedData } from '../utils/supabaseFetch.js';
import './Community.css';
import './About.css';
import communityBg from '../assets/community.webp';
import community1 from '../assets/community-1.webp';
import community2 from '../assets/community-2.webp';
import communityGroup from '../assets/community-group.webp';

const FEED_CACHE_KEY = 'instagram_feed';

function UploadedVideoPlayer({ src }) {
  const videoRef = React.useRef(null);
  const [muted, setMuted] = React.useState(true);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
  }, [muted]);

  return (
    <div className="community-feed-video-wrap">
      <video
        ref={videoRef}
        src={src}
        className="community-feed-video"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      />
      <button
        type="button"
        className="community-feed-mute-btn"
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  );
}

function toEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/?hidecaption=1` : null;
}

function FeedItem({ item }) {
  if (item.source_type === 'upload') {
    return <UploadedVideoPlayer src={item.video_url} />;
  }
  const embedUrl = toEmbedUrl(item.video_url);
  if (!embedUrl) return <div className="community-feed-placeholder">Invalid link</div>;
  return (
    <div className="community-feed-iframe-wrap">
      <iframe
        src={embedUrl}
        className="community-feed-iframe"
        title={item.caption || 'Instagram'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function Community() {
  const parallaxRefs = useRef([]);

  // --- Feed carousel state ---
  const feedTrackRef = useRef(null);
  const feedViewportRef = useRef(null);
  const [feedSlideIndex, setFeedSlideIndex] = useState(0);
  const feedTouchStartX = useRef(0);
  const feedTouchDeltaX = useRef(0);
  const feedIsDragging = useRef(false);
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    const cached = getCachedData(FEED_CACHE_KEY);
    if (cached) {
      setFeedItems(cached);
      return;
    }
    fetchWithCoalescing(FEED_CACHE_KEY, () =>
      supabase.from('instagram_feed').select('id,source_type,video_url,caption,sort_order').order('sort_order', { ascending: true })
    ).then(({ data, error }) => {
      if (!error && data?.length) {
        setCachedData(FEED_CACHE_KEY, data);
        setFeedItems(data);
      }
    });
  }, []);

  const totalFeedSlides = feedItems.length || 1;

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

  // Apply translateX when feedSlideIndex changes
  useEffect(() => {
    if (!feedTrackRef.current) return;
    const slide = feedTrackRef.current.querySelector('.community-feed-item');
    if (!slide) return;
    const gap = 30; // matches CSS gap
    const slideWidth = slide.offsetWidth + gap;
    feedTrackRef.current.style.transform = `translateX(-${feedSlideIndex * slideWidth}px)`;
  }, [feedSlideIndex]);

  const setParallaxRef = index => el => {
    parallaxRefs.current[index] = el;
  };

  const feedGoPrev = useCallback(() => {
    setFeedSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const feedGoNext = useCallback(() => {
    setFeedSlideIndex(prev => Math.min(prev + 1, Math.max(0, totalFeedSlides - 1)));
  }, [totalFeedSlides]);

  // --- Touch / pointer handlers for feed carousel ---
  const handleFeedTouchStart = useCallback((e) => {
    feedIsDragging.current = true;
    feedTouchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    feedTouchDeltaX.current = 0;
    if (feedTrackRef.current) feedTrackRef.current.style.transition = 'none';
  }, []);

  const handleFeedTouchMove = useCallback((e) => {
    if (!feedIsDragging.current || !feedTrackRef.current) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    feedTouchDeltaX.current = currentX - feedTouchStartX.current;
    const slide = feedTrackRef.current.querySelector('.community-feed-item');
    if (!slide) return;
    const gap = 30;
    const slideWidth = slide.offsetWidth + gap;
    const base = -(feedSlideIndex * slideWidth);
    feedTrackRef.current.style.transform = `translateX(${base + feedTouchDeltaX.current}px)`;
  }, [feedSlideIndex]);

  const handleFeedTouchEnd = useCallback(() => {
    if (!feedIsDragging.current) return;
    feedIsDragging.current = false;
    if (feedTrackRef.current) feedTrackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
    const threshold = 50;
    if (feedTouchDeltaX.current < -threshold) {
      feedGoNext();
    } else if (feedTouchDeltaX.current > threshold) {
      feedGoPrev();
    } else {
      // Snap back
      if (feedTrackRef.current) {
        const slide = feedTrackRef.current.querySelector('.community-feed-item');
        if (slide) {
          const gap = 30;
          const slideWidth = slide.offsetWidth + gap;
          feedTrackRef.current.style.transform = `translateX(-${feedSlideIndex * slideWidth}px)`;
        }
      }
    }
  }, [feedGoNext, feedGoPrev, feedSlideIndex]);

  return (
    <div className="community-page">
      {/* 1. Hero Container - matching About layout & assets */}
      <section className="community-hero" style={{ backgroundImage: `url(${communityBg})` }}>
        <div className="community-hero-left" data-aos="fade-right" data-aos-once="false" data-aos-anchor=".community-hero">
          <h1 className="community-hero-title">
            <span className="community-the">The</span>
            <span>Ambroooooosians</span>
            <span className="community-subtitle">This isn't for everyone.</span>
          </h1>
        </div>
        <div className="community-hero-right" data-aos="fade-left" data-aos-once="false" data-aos-anchor=".community-hero">
          <img loading="lazy" decoding="async" src={communityGroup} alt="Ambroooooosians Community" className="community-group-img" />
        </div>
      </section>

      {/* 2 & 3. Replaced with pattern from About.jsx */}
      <div className="why-blocks-wrapper">
        {/* Block 1: A Better Way to Feel */}
        <section className="why-section why-bg-light">
          <div className="why-block-container container-5">
            <div className="why-block why-block--right">
              <div className="why-block__image" ref={setParallaxRef(0)}>
                <img loading="lazy" decoding="async" src={community1} className="community-img-1" alt="Peace Hand" />
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
                <img loading="lazy" decoding="async" src={community2} className="community-img-2" alt="Butterfly" />
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

      {/* 4. Social Feed – Carousel */}
      <section className="community-feed-section">
        <div className="community-highlight-row justify-center">
          <h2 className="community-block__title t-6">
            Social <span>Feed</span>
          </h2>
        </div>

        <div className="community-feed-wrapper">
          {/* Left arrow */}
          <button
            className="community-feed-btn community-feed-btn--left"
            onClick={feedGoPrev}
            disabled={feedSlideIndex === 0}
            aria-label="Previous feed item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            className="community-feed-viewport"
            ref={feedViewportRef}
            onTouchStart={handleFeedTouchStart}
            onTouchMove={handleFeedTouchMove}
            onTouchEnd={handleFeedTouchEnd}
            onMouseDown={handleFeedTouchStart}
            onMouseMove={handleFeedTouchMove}
            onMouseUp={handleFeedTouchEnd}
            onMouseLeave={handleFeedTouchEnd}
          >
            <div className="community-feed-grid" ref={feedTrackRef}>
              {feedItems.length > 0 ? (
                feedItems.map((item, i) => (
                  <div
                    className="community-feed-item"
                    key={item.id}
                    data-aos="fade-left"
                    data-aos-delay={i * 150}
                    data-aos-duration="1000"
                    data-aos-easing="ease-out-cubic"
                    data-aos-once="true"
                  >
                    <FeedItem item={item} />
                  </div>
                ))
              ) : (
                <div className="community-feed-item community-feed-placeholder">
                  <span>Add videos in Admin → Instagram Feed</span>
                </div>
              )}
            </div>
          </div>

          {/* Right arrow */}
          <button
            className="community-feed-btn community-feed-btn--right"
            onClick={feedGoNext}
            disabled={feedSlideIndex === totalFeedSlides - 1}
            aria-label="Next feed item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="community-feed-dots">
          {(feedItems.length || 1) > 0 && Array.from({ length: Math.max(feedItems.length, 1) }).map((_, i) => (
            <button
              key={i}
              className={`community-feed-dot ${i === feedSlideIndex ? 'community-feed-dot--active' : ''}`}
              onClick={() => setFeedSlideIndex(i)}
              aria-label={`Go to feed item ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
