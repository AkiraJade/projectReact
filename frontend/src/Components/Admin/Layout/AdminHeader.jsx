import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';

const AdminHeader = ({ 
  title = "Overview", 
  subtitle = "Store performance and operations", 
  onToggleMobile 
}) => {
  const { user } = useSelector((state) => state.auth || {});
  const { theme, toggleTheme } = useTheme();

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'AD';

  return (
    <header className="ds-admin-header">
      <div className="ds-admin-header-inner">
        {/* Mobile menu hamburger toggle */}
        <button
          type="button"
          className="ds-admin-hamburger"
          onClick={onToggleMobile}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Page Title & Subtitle */}
        <div className="ds-admin-header-titles">
          <h1 className="ds-admin-title">{title}</h1>
          {subtitle && <p className="ds-admin-subtitle">{subtitle}</p>}
        </div>

        {/* Right Actions: Theme Toggle, + Add product & Admin Avatar */}
        <div className="ds-admin-header-actions">
          <button
            type="button"
            className="ds-admin-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="19.78" y1="4.22" x2="18.36" y2="5.64"></line>
              </svg>
            )}
          </button>

          <Link to="/admin/product" className="ds-btn-add-product">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add product</span>
          </Link>

          <Link to="/me" className="ds-admin-profile-pill" title={`${user?.name || 'Administrator'} (${user?.email || 'admin'})`}>
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user?.name} className="ds-admin-avatar-img" />
            ) : (
              <div className="ds-admin-avatar-initials">{initials}</div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
