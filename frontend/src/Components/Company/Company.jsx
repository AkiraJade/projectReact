import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import './Company.css';

const Company = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ds-company-page">
      <MetaData title="The Atelier & Company — Dosnoventa Fixed Gear" />

      {/* =========================================================================
          1. EDITORIAL OPENING / HERO
          ========================================================================= */}
      <section className="ds-company-hero">
        <div className="ds-container-wide">
          <div className="ds-company-hero-content">
            <span className="editorial-label">THE ATELIER / BARCELONA 2026</span>
            <h1 className="ds-company-hero-title">BUILT WITH INTENTION.</h1>
            <p className="ds-company-hero-lead">
              Dosnoventa was born in Barcelona in 2012 out of a fierce rebellion against
              mass-produced, plasticized bicycles. We build uncompromising fixed-gear machines
              conceived for speed, street battle, and timeless aesthetic purity.
            </p>
          </div>
        </div>

        {/* Hero Banner Visual */}
        <div className="ds-company-hero-banner">
          <img
            src="/images/Dosnoventa_Cover_Soulgoods_02.webp"
            alt="Dosnoventa Atelier Fixed Gear Machine"
            className="ds-company-banner-img"
          />
          <div className="ds-company-banner-overlay" />
          <div className="ds-container-wide ds-company-banner-caption">
            <span>BARCELONA CREATIVE ATELIER × TOKYO TRACK DIVISION</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. KEY ATELIER METRICS
          ========================================================================= */}
      <section className="ds-company-metrics-section">
        <div className="ds-container-wide ds-metrics-grid">
          <div className="ds-metric-card">
            <span className="ds-metric-number">2012</span>
            <span className="ds-metric-label">FOUNDED IN BARCELONA</span>
            <p className="ds-metric-sub">Over a decade of unbroken track bike heritage.</p>
          </div>

          <div className="ds-metric-card">
            <span className="ds-metric-number">100%</span>
            <span className="ds-metric-label">ARTISANAL FRAMES</span>
            <p className="ds-metric-sub">Hand-welded in Northern Italy & hand-finished in Spain.</p>
          </div>

          <div className="ds-metric-card">
            <span className="ds-metric-number">0</span>
            <span className="ds-metric-label">FREEWHEELS EVER BUILT</span>
            <p className="ds-metric-sub">Dedicated exclusively to 100% direct fixed-gear drivetrain purity.</p>
          </div>

          <div className="ds-metric-card">
            <span className="ds-metric-number">80+</span>
            <span className="ds-metric-label">COUNTRIES SUPPLIED</span>
            <p className="ds-metric-sub">A worldwide brotherhood connected by the track line.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. THREE PHILOSOPHY PILLARS (DESIGN, CRAFT, CULTURE)
          ========================================================================= */}
      <section className="ds-company-philosophy-section">
        {/* Pillar 01: DESIGN */}
        <div className="ds-philosophy-row ds-philosophy-row-normal">
          <div className="ds-container-wide ds-philosophy-grid">
            <div className="ds-philosophy-text-col">
              <span className="ds-philosophy-index">01 / PHILOSOPHY</span>
              <h2 className="ds-philosophy-heading">PURITY OF TRACK GEOMETRY.</h2>
              <p className="ds-philosophy-body">
                Our frame geometry is forged on genuine velodromes and sharpened on congested metropolitan asphalt.
                Elevated bottom bracket shells eliminate pedal strike on 45-degree banked turns.
                Steep head tube angles offer razor-fast steering response through heavy traffic.
              </p>
              <p className="ds-philosophy-body">
                Every Dosnoventa model eliminates useless cable guides, superfluous bosses, and decorative gimmicks.
                What remains is absolute machine honesty: clean lines, aggressive proportions, and visceral speed.
              </p>
              <div className="ds-philosophy-highlights">
                <span className="ds-highlight-item">• ZERO CABLE CLUTTER</span>
                <span className="ds-highlight-item">• AGGRESSIVE VELODROME RAKE</span>
                <span className="ds-highlight-item">• HIGH BOTTOM BRACKET CLEARANCE</span>
              </div>
            </div>

            <div className="ds-philosophy-img-col">
              <div className="ds-philosophy-img-frame">
                <img
                  src="/images/Dosnoventa_company_x.webp"
                  alt="Dosnoventa Frame Geometry and Design"
                  className="ds-philosophy-img"
                  loading="lazy"
                />
                <div className="ds-philosophy-img-badge">
                  <span>DESIGN DISCIPLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 02: CRAFT */}
        <div className="ds-philosophy-row ds-philosophy-row-reverse">
          <div className="ds-container-wide ds-philosophy-grid">
            <div className="ds-philosophy-text-col">
              <span className="ds-philosophy-index">02 / PHILOSOPHY</span>
              <h2 className="ds-philosophy-heading">OBSESSIVE METALLURGY & CARBON.</h2>
              <p className="ds-philosophy-body">
                We believe true performance begins at the atomic level. Our steel models utilize
                Italian Columbus Spirit triple-butted niobium tubing—drawn to paper-thin wall thicknesses
                that vibrate with unmatched acoustic feedback.
              </p>
              <p className="ds-philosophy-body">
                For our carbon platforms like the Dosnoventa Tokyo, we deploy aerospace-grade
                Toray T800 high-modulus unidirectional carbon. Hand-laid monocoque molds ensure
                rock-solid bottom bracket stiffness under maximum sprint wattage.
              </p>
              <div className="ds-philosophy-highlights">
                <span className="ds-highlight-item">• COLUMBUS SPIRIT NIOBIUM STEEL</span>
                <span className="ds-highlight-item">• TORAY T800 CARBON MONOCOQUE</span>
                <span className="ds-highlight-item">• HAND-ALIGNED ITALIAN WORKMANSHIP</span>
              </div>
            </div>

            <div className="ds-philosophy-img-col">
              <div className="ds-philosophy-img-frame">
                <img
                  src="/images/681065536_18577870018017218_4219711511448520074_n.jpg"
                  alt="Dosnoventa Craft and Metallurgy"
                  className="ds-philosophy-img"
                  loading="lazy"
                />
                <div className="ds-philosophy-img-badge">
                  <span>ATELIER CRAFT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 03: CULTURE */}
        <div className="ds-philosophy-row ds-philosophy-row-normal">
          <div className="ds-container-wide ds-philosophy-grid">
            <div className="ds-philosophy-text-col">
              <span className="ds-philosophy-index">03 / PHILOSOPHY</span>
              <h2 className="ds-philosophy-heading">THE GLOBAL FIXED GEAR SYNDICATE.</h2>
              <p className="ds-philosophy-body">
                Dosnoventa is not a generic cycling supplier; we are a fraternity of nocturnal riders,
                alleycat champions, and daily street warriors. From clandestine group sprints through
                Tokyo&apos;s Shinjuku canyons to alleycat battles in Barcelona and downtown Los Angeles.
              </p>
              <p className="ds-philosophy-body">
                Riding fixed is a sensory philosophy: there is no freewheel, no coasting, and no buffer
                between human cadence and road tarmac. Every pedal stroke is an active decision.
              </p>
              <div className="ds-philosophy-highlights">
                <span className="ds-highlight-item">• STREET CRITERIUM PROVEN</span>
                <span className="ds-highlight-item">• ALLEYCAT VETERANS</span>
                <span className="ds-highlight-item">• DIRECT-DRIVE TRANSCENDENCE</span>
              </div>
            </div>

            <div className="ds-philosophy-img-col">
              <div className="ds-philosophy-img-frame">
                <img
                  src="/images/Dosnoventa_Cover_Soulgoods_02-1.webp"
                  alt="Dosnoventa Global Syndicate Culture"
                  className="ds-philosophy-img"
                  loading="lazy"
                />
                <div className="ds-philosophy-img-badge">
                  <span>URBAN CULTURE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CLOSING CTA BANNER
          ========================================================================= */}
      <section className="ds-company-closing-cta">
        <div className="ds-container">
          <span className="editorial-label">THE BROTHERHOOD</span>
          <h2 className="ds-company-cta-title">FIND YOUR LINE.</h2>
          <p className="ds-company-cta-desc">
            Choose your frameset. Select your cockpit. Join the international fraternity of
            riders who refuse to coast.
          </p>
          <div className="ds-company-cta-actions">
            <Link to="/shop" className="ds-btn">
              EXPLORE THE COLLECTION <span className="ds-arrow">→</span>
            </Link>
            <Link to="/stories" className="ds-btn ds-btn-outline">
              READ STORIES
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Company;
