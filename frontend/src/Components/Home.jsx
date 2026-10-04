import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaData from './Layout/MetaData';
import './Home.css';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="ds-landing-wrapper">
      <MetaData title="DOSNOVENTA® — Fixed Gear Bicycles & Precision Frames" />

      {/* =========================================================================
          1. HERO SECTION (Full-screen cinematic, Barcelona urban, asymmetrical)
          ========================================================================= */}
      <section className="ds-hero-section">
        {/* Parallax Hero Background Container */}
        <div
          className="ds-hero-bg-container"
          style={{ transform: `translateY(${scrollY * 0.22}px)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=2400&q=95"
            alt="Dosnoventa Fixed Gear Bicycle in Urban Environment"
            className="ds-hero-bg-image"
          />
          <div className="ds-hero-vignette"></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="ds-hero-content-layer">
          <div className="ds-container-wide ds-hero-inner">
            {/* Top metadata tags with explicit hierarchy */}
            <div className="ds-hero-meta-tag anim-reveal">
              <span className="editorial-badge">BARCELONA // ATELIER 2026</span>
              <span className="editorial-label ds-hero-tertiary-label">
                TRACK-PROVEN / URBAN MASTERY
              </span>
            </div>

            {/* Massive Display Title - responsive to fit 85-92% of viewport without overflow */}
            <div className="ds-hero-headline-block">
              <div className="ds-hero-title-wrapper">
                <svg
                  className="ds-hero-svg-title"
                  viewBox="0 0 1200 130"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMinYMid meet"
                  aria-label="DOSNOVENTA"
                  role="img"
                >
                  <text
                    x="0"
                    y="108"
                    textLength="1200"
                    lengthAdjust="spacingAndGlyphs"
                    className="ds-hero-svg-text"
                  >
                    DOSNOVENTA
                  </text>
                </svg>
              </div>

              <div className="ds-hero-sub-row">
                <p className="ds-hero-statement">
                  FIXED. FAST. UNCOMPROMISING.
                </p>
                <div className="ds-hero-cta-wrap">
                  <a href="#featured-bike" className="ds-btn ds-hero-cta">
                    EXPLORE THE LINEUP <span className="ds-arrow">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Hero Bar with accurate Barcelona technical documentation & subtle scroll cue */}
            <div className="ds-hero-bottom-bar">
              <div className="ds-hero-specs-group">
                <div className="ds-hero-spec-item">
                  <span className="editorial-label">FRAME</span>
                  <span className="ds-spec-val">COLUMBUS SPIRIT STEEL</span>
                </div>
                <div className="ds-hero-spec-item">
                  <span className="editorial-label">GEOMETRY</span>
                  <span className="ds-spec-val">URBAN / TRACK</span>
                </div>
                <div className="ds-hero-spec-item">
                  <span className="editorial-label">RIDE TYPE</span>
                  <span className="ds-spec-val">FIXED GEAR</span>
                </div>
              </div>

              {/* Subtle Scroll Cue */}
              <div className="ds-hero-scroll-cue">
                <span className="ds-scroll-label">01 / 06 &nbsp; SCROLL TO DISCOVER</span>
                <span className="ds-scroll-arrow">↓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. INTRODUCTION SECTION (Large editorial statement & high negative space)
          ========================================================================= */}
      <section className="ds-intro-section">
        <div className="ds-container">
          <div className="ds-intro-layout">
            <div className="ds-intro-label-col">
              <span className="editorial-label">01 // MANIFESTO</span>
              <div className="ds-intro-vertical-line"></div>
            </div>

            <div className="ds-intro-statement-col">
              <h2 className="ds-intro-heading">
                WE DON'T MAKE BIKES <br />
                FOR EVERYONE.
              </h2>
              <div className="ds-intro-body-row">
                <p className="ds-intro-paragraph">
                  Dosnoventa was born from the asphalt of Barcelona, shaped by raw fixed-gear culture,
                  precision metallurgy, and riders who demand zero compromise. Every weld, taper, and
                  angle is tuned for unrelenting urban velocity.
                </p>
                <div className="ds-intro-coords">
                  <span>LAT 41.3879° N</span>
                  <span>LON 2.1699° E</span>
                  <span className="ds-accent-dot-active">BARCELONA HQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. BRAND VISUAL SECTION (Asymmetrical, overlapping editorial photo essay)
          ========================================================================= */}
      <section className="ds-brand-visuals-section" id="stories">
        <div className="ds-container-wide">
          <div className="ds-visuals-header">
            <span className="editorial-badge">THE ARCHIVES</span>
            <span className="editorial-label">STREET CULTURE & VELODROME ROOTS</span>
          </div>

          <div className="ds-asymmetric-gallery">
            {/* Visual 1: Large primary urban bike shot */}
            <div className="ds-gallery-item ds-gallery-item-1">
              <div className="ds-gallery-img-box">
                <img
                  src="https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=85"
                  alt="Dosnoventa Frame Detail"
                  className="ds-gallery-img"
                />
                <div className="ds-gallery-caption">
                  <span className="editorial-label">BARCELONA / 2012</span>
                  <h4 className="ds-gallery-title">GENESIS OF RAW ALUMINUM</h4>
                </div>
              </div>
            </div>

            {/* Visual 2: Medium offset urban rider in motion */}
            <div className="ds-gallery-item ds-gallery-item-2">
              <div className="ds-gallery-img-box">
                <img
                  src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1000&q=85"
                  alt="Fixed Gear Urban Night Riding"
                  className="ds-gallery-img"
                />
                <div className="ds-gallery-caption">
                  <span className="editorial-label">FIXED GEAR / URBAN CULTURE</span>
                  <h4 className="ds-gallery-title">NO BRAKES. NO EXCUSES.</h4>
                </div>
              </div>
            </div>

            {/* Visual 3: Small offset cockpit and carbon engineering detail */}
            <div className="ds-gallery-item ds-gallery-item-3">
              <div className="ds-gallery-img-box">
                <img
                  src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=85"
                  alt="Precision Fixed Gear Componentry"
                  className="ds-gallery-img"
                />
                <div className="ds-gallery-caption">
                  <span className="editorial-label">THE BROTHERHOOD</span>
                  <h4 className="ds-gallery-title">PRECISION COCKPIT SYSTEM</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURED BIKE INTRODUCTION (Dosnoventa Barcelona showcase)
          ========================================================================= */}
      <section className="ds-featured-bike-section" id="bikes">
        <div className="ds-container-wide">
          <div className="ds-bike-showcase" id="featured-bike">
            {/* Background Big Number */}
            <div className="ds-bike-giant-number">01</div>

            <div className="ds-bike-grid">
              {/* Bike Editorial Information */}
              <div className="ds-bike-info">
                <div className="editorial-badge">ICONIC FLAGSHIP BUILD</div>
                <h2 className="ds-bike-name">BARCELONA</h2>
                <div className="ds-bike-tagline">
                  <span>STEEL.</span>
                  <span>PURE.</span>
                  <span>TIMELESS.</span>
                </div>

                <p className="ds-bike-desc">
                  Crafted with premium Italian Spirit triple-butted steel tubing and Columbus carbon fork.
                  Designed for riders seeking extreme stiffness, razor-sharp responsiveness, and the
                  unmatched ride quality that only artisanal steel geometry delivers.
                </p>

                <div className="ds-bike-specs-list">
                  <div className="ds-bike-spec">
                    <span className="editorial-label">FRAME WEIGHT</span>
                    <strong>1,690 G</strong>
                  </div>
                  <div className="ds-bike-spec">
                    <span className="editorial-label">TIRE CLEARANCE</span>
                    <strong>700 X 28C</strong>
                  </div>
                  <div className="ds-bike-spec">
                    <span className="editorial-label">ORIGIN</span>
                    <strong>HANDMADE IN ITALY</strong>
                  </div>
                </div>

                <div className="ds-bike-actions">
                  <Link to="/register" className="ds-btn">
                    DISCOVER BARCELONA <span className="ds-arrow">→</span>
                  </Link>
                  <span className="editorial-label">STARTING AT €1,450 EUR</span>
                </div>
              </div>

              {/* Dominant Bicycle Image */}
              <div className="ds-bike-hero-visual">
                <div className="ds-bike-image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1600&q=90"
                    alt="Dosnoventa Barcelona Fixed Gear Bike"
                    className="ds-bike-main-img"
                  />
                  <div className="ds-bike-lens-flare"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CULTURE SECTION (The World of Dosnoventa / Global Syndicate)
          ========================================================================= */}
      <section className="ds-culture-section" id="world">
        <div className="ds-container">
          <div className="ds-culture-header">
            <span className="editorial-label">02 // GLOBAL EXPEDITIONS</span>
            <h2 className="ds-culture-title">THE WORLD OF DOSNOVENTA</h2>
            <p className="ds-culture-desc">
              From alleycats in Tokyo to crit races in Brooklyn, the Dosnoventa crew leaves tire
              skids on the world's most unforgiving tarmac.
            </p>
          </div>
        </div>

        {/* Global Cities Cards Layout */}
        <div className="ds-cities-wrapper">
          <div className="ds-city-card">
            <img
              src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80"
              alt="Barcelona Streets"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <span className="ds-city-number">01</span>
              <h3 className="ds-city-name">BARCELONA</h3>
              <span className="ds-city-tag">MEDITERRANEAN ROOTS</span>
            </div>
          </div>

          <div className="ds-city-card">
            <img
              src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80"
              alt="Tokyo Neon Fixed Gear"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <span className="ds-city-number">02</span>
              <h3 className="ds-city-name">TOKYO</h3>
              <span className="ds-city-tag">SHIBUYA CRITERIUM</span>
            </div>
          </div>

          <div className="ds-city-card">
            <img
              src="https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=900&q=80"
              alt="Los Angeles Concrete River"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <span className="ds-city-number">03</span>
              <h3 className="ds-city-name">LOS ANGELES</h3>
              <span className="ds-city-tag">DOWNTOWN PURSUIT</span>
            </div>
          </div>

          <div className="ds-city-card">
            <img
              src="https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=900&q=80"
              alt="Osaka Night Riding"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <span className="ds-city-number">04</span>
              <h3 className="ds-city-name">OSAKA</h3>
              <span className="ds-city-tag">DOTONBORI SPRINT</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FINAL CALL TO ACTION (Ride Your City)
          ========================================================================= */}
      <section className="ds-final-cta-section">
        <div className="ds-final-cta-bg">
          <img
            src="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=85"
            alt="Ride Your City"
            className="ds-final-bg-img"
          />
          <div className="ds-final-overlay"></div>
        </div>

        <div className="ds-container ds-final-content">
          <span className="editorial-badge">CLAIM YOUR MACHINE</span>
          <h2 className="ds-final-title">RIDE YOUR CITY.</h2>
          <p className="ds-final-subtitle">
            Join the international fraternity of track bike riders. Precision geometries, handcrafted frames,
            zero compromises.
          </p>
          <div className="ds-final-btn-group">
            <Link to="/register" className="ds-btn">
              EXPLORE DOSNOVENTA <span className="ds-arrow">→</span>
            </Link>
            <Link to="/login" className="ds-btn ds-btn-outline">
              RIDER LOGIN
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;