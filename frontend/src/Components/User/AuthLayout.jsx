import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const AuthLayout = ({ children, title, subtitle, imageSide = 'left' }) => {
  return (
    <div className={`ds-auth-page ${imageSide === 'right' ? 'ds-auth-reverse' : ''}`}>
      <div className="ds-auth-grid">
        {/* Photo Column */}
        <div className="ds-auth-photo-panel">
          <div className="ds-auth-photo-wrapper">
            <img
              src="https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1600&q=85"
              alt="Dosnoventa Track Fixed Gear"
              className="ds-auth-photo"
            />
            <div className="ds-auth-photo-overlay">
              <div className="ds-auth-photo-text">
                <span className="editorial-label">STREET CRITERIUM / RAW REPUTATION</span>
                <h3 className="ds-auth-photo-heading">ENGINEERED FOR THE UNCOMPROMISING.</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="ds-auth-form-panel">
          <div className="ds-auth-form-box">
            <div className="ds-auth-header">
              <span className="editorial-label">AUTHENTICATION</span>
              <h1 className="ds-auth-title">{title}</h1>
              {subtitle && <p className="ds-auth-subtitle">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
