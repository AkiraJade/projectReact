import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="ds-footer">
      <div className="ds-container-wide">
        {/* Top statement */}
        <div className="ds-footer-top">
          <div className="ds-footer-brand-col">
            <span className="ds-footer-wordmark">DOSNOVENTA</span>
            <p className="ds-footer-statement">
              HANDMADE RUNS IN OUR VEINS. DESIGNED IN BARCELONA. BUILT TO DOMINATE THE STREETS WORLDWIDE.
            </p>
          </div>

          <div className="ds-footer-grid">
            <div className="ds-footer-nav-col">
              <span className="ds-footer-heading">NAVIGATION</span>
              <ul className="ds-footer-list">
                <li><Link to="/#bikes">BIKES</Link></li>
                <li><Link to="/#world">WORLD</Link></li>
                <li><Link to="/#stories">STORIES</Link></li>
                <li><Link to="/#catalog">SHOP</Link></li>
                <li><a href="#dealers">DEALERS</a></li>
                <li><a href="#contact">CONTACT</a></li>
              </ul>
            </div>

            <div className="ds-footer-nav-col">
              <span className="ds-footer-heading">CULTURE & SOCIAL</span>
              <ul className="ds-footer-list">
                <li><a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM ↗</a></li>
                <li><a href="https://youtube.com" target="_blank" rel="noreferrer">YOUTUBE ↗</a></li>
                <li><a href="https://strava.com" target="_blank" rel="noreferrer">STRAVA CLUB ↗</a></li>
                <li><a href="https://vimeo.com" target="_blank" rel="noreferrer">VIMEO ↗</a></li>
              </ul>
            </div>

            <div className="ds-footer-nav-col">
              <span className="ds-footer-heading">LEGAL & SERVICE</span>
              <ul className="ds-footer-list">
                <li><Link to="/privacy">PRIVACY POLICY</Link></li>
                <li><Link to="/terms">TERMS OF SERVICE</Link></li>
                <li><Link to="/shipping">SHIPPING & IMPORT</Link></li>
                <li><Link to="/warranty">LIFETIME WARRANTY</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ds-footer-bottom">
          <div className="ds-footer-meta">
            <span>© {new Date().getFullYear()} DOSNOVENTA BICYCLES S.L. ALL RIGHTS RESERVED.</span>
            <span>BARCELONA — TOKYO — LOS ANGELES — SEOUL</span>
          </div>
          <div className="ds-footer-badge">
            <span className="ds-indicator-dot"></span>
            <span>PRECISION ENGINEERING — 100% FIXED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;