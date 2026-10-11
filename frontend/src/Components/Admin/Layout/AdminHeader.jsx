import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminHeader = ({ 
  title = "Overview", 
  subtitle = "Store performance and operations", 
  onToggleMobile 
}) => {
  const { user } = useSelector((state) => state.auth || {});

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

        {/* Right Actions: + Add product & Admin Avatar */}
        <div className="ds-admin-header-actions">
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
