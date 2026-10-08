import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import MetaData from './Layout/MetaData';
import './Home.css';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [heroMounted, setHeroMounted] = useState(false);

  const heroSectionRef = useRef(null);
  const galleryRef = useRef(null);
  const bikeSectionRef = useRef(null);

  // Smooth scroll & parallax tracking via RAF
  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        setScrollY(currentScrollY);

        // Calculate scroll progress percentage (0 - 100%)
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const progress = (currentScrollY / docHeight) * 100;
          setScrollProgress(Math.min(Math.max(progress, 0), 100));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // Trigger initial hero reveal animation sequence
    const timer = setTimeout(() => {
      setHeroMounted(true);
    }, 50);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  // Subtle Mouse Parallax (Desktop Only)
  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 10; // -5px to 5px shift
    const y = (clientY / innerHeight - 0.5) * 10;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // IntersectionObserver for scroll-triggered section reveals
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.15,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const revealElements = document.querySelectorAll('.ds-scroll-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="ds-landing-wrapper">
      <MetaData title="DOSNOVENTA® — Fixed Gear Bicycles & Precision Frames" />

      {/* Vertical Scroll Progress Indicator Line (Subtle Right Margin) */}
      <div className="ds-scroll-progress-container" aria-hidden="true">
        <div
          className="ds-scroll-progress-bar"
          style={{ height: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* =========================================================================
          1. HERO SECTION (Full-screen cinematic, Barcelona urban, asymmetrical)
          ========================================================================= */}
      <section
        className={`ds-hero-section ${heroMounted ? 'is-loaded' : ''}`}
        ref={heroSectionRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Parallax Hero Background Container with Mouse Offset & Scroll Scale */}
        <div
          className="ds-hero-bg-container"
          style={{
            transform: `translate3d(${mouseOffset.x * -0.4}px, ${scrollY * 0.18 + mouseOffset.y * -0.4}px, 0) scale(${
              1.04 - Math.min(scrollY * 0.00025, 0.04)
            })`,
          }}
        >
          <img
            src="/images/Dosnoventa_Cover_Soulgoods_02.webp"
            alt="Dosnoventa Fixed Gear Bicycle in Urban Environment"
            className="ds-hero-bg-image"
          />
          <div className="ds-hero-vignette"></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="ds-hero-content-layer">
          <div className="ds-container-wide ds-hero-inner">
            {/* Top metadata tag */}
            <div className="ds-hero-meta-tag hero-stagger-1">
              <span className="editorial-label ds-hero-tertiary-label">
                TRACK-PROVEN / URBAN MASTERY
              </span>
            </div>

            {/* Massive Display Title - Layered Parallax & Responsive viewBox fit */}
            <div className="ds-hero-headline-block hero-stagger-2">
              <div
                className="ds-hero-title-wrapper"
                style={{
                  transform: `translate3d(${mouseOffset.x * 0.3}px, ${scrollY * 0.28 + mouseOffset.y * 0.3}px, 0)`,
                }}
              >
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

              <div className="ds-hero-sub-row hero-stagger-3">
                <p className="ds-hero-statement">
                  FIXED. FAST. UNCOMPROMISING.
                </p>
                <div className="ds-hero-cta-wrap hero-stagger-4">
                  <a href="#featured-bike" className="ds-btn ds-hero-cta">
                    EXPLORE THE LINEUP <span className="ds-arrow">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Hero Bar with accurate Barcelona technical documentation & subtle scroll cue */}
            <div className="ds-hero-bottom-bar hero-stagger-5">
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
                <span className="ds-scroll-label">SCROLL TO DISCOVER</span>
                <span className="ds-scroll-arrow">↓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. INTRODUCTION SECTION (Large editorial statement & high negative space)
          ========================================================================= */}
      <section className="ds-intro-section ds-scroll-reveal ds-reveal-up">
        <div className="ds-container">
          <div className="ds-intro-layout">
            <div className="ds-intro-label-col">
              <span className="editorial-label">MANIFESTO</span>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. BRAND VISUAL SECTION (Asymmetrical, overlapping editorial photo essay)
          ========================================================================= */}
      <section className="ds-brand-visuals-section" id="stories" ref={galleryRef}>
        <div className="ds-container-wide">
          <div className="ds-visuals-header ds-scroll-reveal ds-reveal-up">
            <span className="editorial-label">STREET CULTURE & VELODROME ROOTS</span>
          </div>

          <div className="ds-asymmetric-gallery">
            {/* Visual 1: Large primary urban bike shot (Shift Left) */}
            <div className="ds-gallery-item ds-gallery-item-1 ds-scroll-reveal ds-reveal-left">
              <div className="ds-gallery-img-box">
                <img
                  src="/images/681065536_18577870018017218_4219711511448520074_n.jpg"
                  alt="Dosnoventa Frame Detail"
                  className="ds-gallery-img"
                  style={{
                    transform: `translateY(${Math.max(0, Math.min((scrollY - 1000) * 0.08, 40))}px) scale(1.02)`,
                  }}
                />
                <div className="ds-gallery-caption">
                  <span className="editorial-label">BARCELONA / 2012</span>
                  <h4 className="ds-gallery-title">GENESIS OF RAW ALUMINUM</h4>
                </div>
              </div>
            </div>

            {/* Visual 2: Medium offset urban rider in motion (Shift Right) */}
            <div className="ds-gallery-item ds-gallery-item-2 ds-scroll-reveal ds-reveal-right">
              <div className="ds-gallery-img-box">
                <img
                  src="/images/681284752_18577870027017218_3411028472816611521_n.jpg"
                  alt="Fixed Gear Urban Night Riding"
                  className="ds-gallery-img"
                  style={{
                    transform: `translateY(${Math.max(0, Math.min((scrollY - 1100) * -0.06, 30))}px) scale(1.02)`,
                  }}
                />
                <div className="ds-gallery-caption">
                  <span className="editorial-label">FIXED GEAR / URBAN CULTURE</span>
                  <h4 className="ds-gallery-title">NO BRAKES. NO EXCUSES.</h4>
                </div>
              </div>
            </div>

            {/* Visual 3: Small offset cockpit and carbon engineering detail (Shift Left) */}
            <div className="ds-gallery-item ds-gallery-item-3 ds-scroll-reveal ds-reveal-left">
              <div className="ds-gallery-img-box">
                <img
                  src="/images/683865055_18577869997017218_391512738857703560_n.jpg"
                  alt="Precision Fixed Gear Componentry"
                  className="ds-gallery-img"
                  style={{
                    transform: `translateY(${Math.max(0, Math.min((scrollY - 1300) * 0.07, 35))}px) scale(1.02)`,
                  }}
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
      <section className="ds-featured-bike-section" id="bikes" ref={bikeSectionRef}>
        <div className="ds-container-wide">
          <div className="ds-bike-showcase" id="featured-bike">
            <div className="ds-bike-grid">
              {/* Bike Editorial Information */}
              <div className="ds-bike-info ds-scroll-reveal ds-reveal-up">
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

                {/* Staggered Technical Specification Reveal */}
                <div className="ds-bike-specs-list ds-scroll-reveal ds-reveal-stagger-specs">
                  <div className="ds-bike-spec spec-item-1">
                    <span className="editorial-label">FRAME WEIGHT</span>
                    <strong>1,690 G</strong>
                  </div>
                  <div className="ds-bike-spec spec-item-2">
                    <span className="editorial-label">TIRE CLEARANCE</span>
                    <strong>700 X 28C</strong>
                  </div>
                  <div className="ds-bike-spec spec-item-3">
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
              <div className="ds-bike-hero-visual ds-scroll-reveal ds-reveal-right">
                <div className="ds-bike-image-wrapper">
                  <img
                    src="/images/Dosnoventa_company_x.webp"
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
          <div className="ds-culture-header ds-scroll-reveal ds-reveal-up">
            <span className="editorial-label">GLOBAL EXPEDITIONS</span>
            <h2 className="ds-culture-title">THE WORLD OF DOSNOVENTA</h2>
            <p className="ds-culture-desc">
              From alleycats in Tokyo to crit races in Brooklyn, the Dosnoventa crew leaves tire
              skids on the world's most unforgiving tarmac.
            </p>
          </div>
        </div>

        {/* Global Cities Cards Layout with staggered entrance */}
        <div className="ds-cities-wrapper ds-scroll-reveal ds-reveal-stagger-cards">
          <div className="ds-city-card city-card-1">
            <img
              src="/images/743072442_1409502627900168_5996516535864156955_n.jpg"
              alt="Barcelona Streets"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <h3 className="ds-city-name">BARCELONA</h3>
              <span className="ds-city-tag">MEDITERRANEAN ROOTS</span>
            </div>
          </div>

          <div className="ds-city-card city-card-2">
            <img
              src="/images/750585957_1635177937575716_5452436604089229346_n.jpg"
              alt="Tokyo Neon Fixed Gear"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <h3 className="ds-city-name">TOKYO</h3>
              <span className="ds-city-tag">SHIBUYA CRITERIUM</span>
            </div>
          </div>

          <div className="ds-city-card city-card-3">
            <img
              src="/images/751842550_1358990196371380_4773847609190568757_n.jpg"
              alt="Los Angeles Concrete River"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <h3 className="ds-city-name">LOS ANGELES</h3>
              <span className="ds-city-tag">DOWNTOWN PURSUIT</span>
            </div>
          </div>

          <div className="ds-city-card city-card-4">
            <img
              src="/images/753733308_1664608384623728_2511696803900945541_n.jpg"
              alt="Osaka Night Riding"
              className="ds-city-img"
            />
            <div className="ds-city-overlay">
              <h3 className="ds-city-name">OSAKA</h3>
              <span className="ds-city-tag">DOTONBORI SPRINT</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FINAL CALL TO ACTION (Ride Your City)
          ========================================================================= */}
      <section className="ds-final-cta-section ds-scroll-reveal ds-reveal-up">
        <div className="ds-final-cta-bg">
          <img
            src="/images/Dosnoventa_Cover_Soulgoods_02-1.webp"
            alt="Ride Your City"
            className="ds-final-bg-img"
            style={{
              transform: `scale(${1.06 - Math.min((scrollY - 3000) * 0.0001, 0.06)})`,
            }}
          />
          <div className="ds-final-overlay"></div>
        </div>

        <div className="ds-container ds-final-content">
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