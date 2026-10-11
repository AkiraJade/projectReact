import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../actions/userActions';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="ds-admin-backdrop" 
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`ds-admin-rail ${mobileOpen ? 'ds-admin-rail-open' : ''}`} aria-label="Admin Navigation Rail">
        {/* Brand Mark (Bicycle Icon) */}
        <div className="ds-admin-rail-brand">
          <NavLink to="/admin" title="Dosnoventa Atelier" className="ds-rail-logo-link" onClick={closeMobile}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Dosnoventa Brand Icon">
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l3-3h3" />
              <path d="m14 9-5 8.5" />
              <path d="M5.5 17.5 9 9" />
              <path d="M18.5 17.5 12 17.5" />
            </svg>
          </NavLink>
        </div>

        {/* Primary Navigation Items */}
        <nav className="ds-admin-rail-nav">
          {/* 1. Overview / Dashboard */}
          <NavLink
            to="/admin"
            end
            title="Overview"
            className={({ isActive }) => `ds-rail-item ${isActive ? 'ds-rail-item-active' : ''}`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="14" rx="1.5" />
              <rect width="7" height="7" x="3" y="14" rx="1.5" />
            </svg>
            <span className="ds-rail-sr">Overview</span>
          </NavLink>

          {/* 2. Analytics */}
          <NavLink
            to="/dashboard"
            title="Analytics"
            className={({ isActive }) => `ds-rail-item ${isActive ? 'ds-rail-item-active' : ''}`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span className="ds-rail-sr">Analytics</span>
          </NavLink>

          {/* 3. Products */}
          <NavLink
            to="/admin/products"
            title="Products"
            className={({ isActive }) => `ds-rail-item ${isActive ? 'ds-rail-item-active' : ''}`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 8-9-5-9 5 9 5 9-5z" />
              <path d="M3 8v8l9 5 9-5V8" />
              <path d="M12 13v8" />
            </svg>
            <span className="ds-rail-sr">Products</span>
          </NavLink>

          {/* 4. Orders */}
          <NavLink
            to="/admin/orders"
            title="Orders"
            className={({ isActive }) => `ds-rail-item ${isActive ? 'ds-rail-item-active' : ''}`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="ds-rail-sr">Orders</span>
          </NavLink>

          {/* 5. Users / Customers */}
          <NavLink
            to="/admin/users"
            title="Customers"
            className={({ isActive }) => `ds-rail-item ${isActive ? 'ds-rail-item-active' : ''}`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="ds-rail-sr">Customers</span>
          </NavLink>

          {/* 6. Reviews */}
          <NavLink
            to="/admin/reviews"
            title="Reviews"
            className={({ isActive }) => `ds-rail-item ${isActive ? 'ds-rail-item-active' : ''}`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="ds-rail-sr">Reviews</span>
          </NavLink>
        </nav>

        {/* Bottom utility controls */}
        <div className="ds-admin-rail-bottom">
          {/* Settings / Profile */}
          <NavLink
            to="/me"
            title="Admin Profile & Settings"
            className="ds-rail-item"
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="ds-rail-sr">Settings</span>
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            title="Logout"
            className="ds-rail-item ds-rail-logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="ds-rail-sr">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
