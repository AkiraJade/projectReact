import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import { STORIES_DATA, STORY_CATEGORIES } from '../../data/storiesData';
import './Stories.css';

const Stories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef(null);

  // Sync category state with searchParams
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Accessibility: detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const filteredStories = useMemo(() => {
    if (activeCategory === 'All') {
      return STORIES_DATA;
    }
    return STORIES_DATA.filter(
      (s) => s.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory]);

  const featuredStory = STORIES_DATA[0];

  return (
    <div className="ds-stories-page">
      <MetaData title="Journal & Stories — Dosnoventa Fixed Gear" />

      {/* =========================================================================
          1. CINEMATIC VIDEO HERO (75-85vh)
          ========================================================================= */}
      <section className="ds-stories-hero" aria-label="Stories Hero Showcase">
        <div className="ds-hero-video-container">
          <video
            ref={videoRef}
            className="ds-hero-video"
            autoPlay={!prefersReducedMotion}
            muted
            loop
            playsInline
            poster="/images/Dosnoventa_Cover_Soulgoods_02.webp"
            aria-label="Dosnoventa Ghost Motion midnight street film"
          >
            <source src="/videos/GHOSTMOTION_COVER.mp4" type="video/mp4" />
            <source src="/images/GHOSTMOTION_COVER.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="ds-hero-overlay" />
        </div>

        {/* Hero Editorial Overlay Content */}
        <div className="ds-stories-hero-content ds-container-wide">
          <div className="ds-stories-hero-badge">
            <span className="editorial-label">DOSNOVENTA JOURNAL / 01</span>
            <span className="ds-hero-bullet">•</span>
            <span className="editorial-label">GLOBAL CHRONICLES</span>
          </div>

          <h1 className="ds-stories-hero-title">
            BEYOND THE RIDE.
          </h1>

          <p className="ds-stories-hero-sub">
            Stories of speed, architecture, nocturnal criteriums, and fixed-gear devotion
            across the world&apos;s concrete capitals. From the back alleys of Shibuya to
            the coastal asphalt of Barcelona.
          </p>

          <div className="ds-stories-hero-actions">
            <Link to={`/stories/${featuredStory.slug}`} className="ds-btn">
              READ FEATURED STORY <span className="ds-arrow">→</span>
            </Link>

            <button
              type="button"
              className="ds-video-control-btn"
              onClick={toggleVideoPlayback}
              aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
            >
              <span className="ds-video-icon">{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'PAUSE MOTION' : 'PLAY MOTION'}</span>
            </button>
          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="ds-stories-scroll-indicator" aria-hidden="true">
          <span className="ds-scroll-text">SCROLL TO DISCOVER</span>
          <span className="ds-scroll-arrow">↓</span>
        </div>
      </section>

      {/* =========================================================================
          2. EDITORIAL INDEX & CATEGORY FILTERING
          ========================================================================= */}
      <section className="ds-stories-catalog-section" id="catalog">
        <div className="ds-container-wide">
          {/* Section Header */}
          <div className="ds-stories-section-header">
            <div>
              <span className="editorial-label">THE ARCHIVE</span>
              <h2 className="ds-stories-section-title">STORIES FROM THE STREETS.</h2>
            </div>
            <span className="ds-stories-count-tag">
              {filteredStories.length} {filteredStories.length === 1 ? 'DISPATCH' : 'DISPATCHES'}
            </span>
          </div>

          {/* Category Tabs */}
          <div className="ds-stories-categories-bar" role="tablist" aria-label="Stories Category Filters">
            {STORY_CATEGORIES.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`ds-story-category-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Stories Grid */}
          <div className="ds-stories-grid">
            {filteredStories.map((story, index) => {
              const isLarge = index === 0;
              return (
                <article
                  key={story.id}
                  className={`ds-story-card ${isLarge ? 'ds-story-card-featured' : ''}`}
                >
                  <Link to={`/stories/${story.slug}`} className="ds-story-card-link">
                    <div className="ds-story-img-wrap">
                      <img
                        src={story.heroImage}
                        alt={story.title}
                        className="ds-story-img"
                        loading="lazy"
                      />
                      <div className="ds-story-badge-row">
                        <span className="ds-story-cat-badge">{story.category}</span>
                        <span className="ds-story-time-badge">{story.readTime}</span>
                      </div>
                    </div>

                    <div className="ds-story-card-body">
                      <div className="ds-story-meta-row">
                        <span className="ds-story-date">{story.date}</span>
                        <span className="ds-story-divider">/</span>
                        <span className="ds-story-author">{story.author}</span>
                      </div>

                      <h3 className="ds-story-title">{story.title}</h3>

                      <p className="ds-story-excerpt">{story.excerpt}</p>

                      <div className="ds-story-read-link">
                        <span>READ DISPATCH</span>
                        <span className="ds-arrow">→</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {filteredStories.length === 0 && (
            <div className="ds-stories-empty">
              <span className="ds-empty-glyph">∅</span>
              <h3>NO DISPATCHES FOUND IN THIS CATEGORY</h3>
              <p>Check back soon for upcoming race reports and rider dispatches.</p>
              <button
                type="button"
                className="ds-btn"
                onClick={() => handleCategorySelect('All')}
              >
                VIEW ALL STORIES →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          3. EDITORIAL NEWSLETTER / MANIFESTO BANNER
          ========================================================================= */}
      <section className="ds-stories-manifesto-banner">
        <div className="ds-container">
          <span className="editorial-label">PRINT & DIGITAL GAZETTE</span>
          <h3 className="ds-manifesto-heading">DISPATCHES FROM THE UNDERGROUND.</h3>
          <p className="ds-manifesto-text">
            Join the international Dosnoventa syndicate. Receive exclusive midnight film releases,
            limited frameset drop announcements, and technical essays direct to your inbox.
          </p>
          <div className="ds-manifesto-actions">
            <Link to="/shop" className="ds-btn">
              EXPLORE MACHINES <span className="ds-arrow">→</span>
            </Link>
            <Link to="/company" className="ds-btn ds-btn-outline">
              ABOUT THE ATELIER
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stories;
