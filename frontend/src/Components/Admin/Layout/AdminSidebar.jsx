import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { logout } from '../../../actions/userActions';
import { getAdminConfig } from '../../../Utils/helpers';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});
  const [trashCount, setTrashCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchTrashCount = async () => {
      try {
        const config = getAdminConfig();
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/counts`, config);
        if (isMounted && data.success && data.counts) {
          setTrashCount(data.counts.total || 0);
        }
      } catch (err) {
        // silent fail on network or auth check
      }
    };
    fetchTrashCount();
    return () => { isMounted = false; };
  }, [location.pathname]);

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

      <aside 
        className={`ds-admin-sidebar ${mobileOpen ? 'ds-admin-sidebar-open' : ''}`} 
        aria-label="Admin Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className="ds-admin-sidebar-brand">
          <NavLink to="/admin/dashboard" className="ds-sidebar-brand-link" onClick={closeMobile}>
            <div className="ds-sidebar-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Dosnoventa Logo">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l3-3h3" />
                <path d="m14 9-5 8.5" />
                <path d="M5.5 17.5 9 9" />
                <path d="M18.5 17.5 12 17.5" />
              </svg>
            </div>
            <div className="ds-sidebar-brand-text">
              <span className="ds-brand-title">DOSNOVENTA</span>
              <span className="ds-brand-subtitle">ATELIER ADMIN</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Sections */}
        <div className="ds-admin-sidebar-content">
          <div className="ds-sidebar-section">
            <div className="ds-sidebar-section-title">Navigation</div>
            <nav className="ds-sidebar-nav">
              {/* 1. Dashboard */}
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="14" rx="1.5" />
                    <rect width="7" height="7" x="3" y="14" rx="1.5" />
                  </svg>
                </span>
                <span className="ds-nav-text">Dashboard</span>
              </NavLink>

              {/* 2. Analytics */}
              <NavLink
                to="/admin/analytics"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </span>
                <span className="ds-nav-text">Analytics</span>
              </NavLink>
            </nav>
          </div>

          <div className="ds-sidebar-section">
            <div className="ds-sidebar-section-title">Management</div>
            <nav className="ds-sidebar-nav">
              {/* 3. Products */}
              <NavLink
                to="/admin/products"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21 8-9-5-9 5 9 5 9-5z" />
                    <path d="M3 8v8l9 5 9-5V8" />
                    <path d="M12 13v8" />
                  </svg>
                </span>
                <span className="ds-nav-text">Products</span>
              </NavLink>

              {/* 4. Orders */}
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </span>
                <span className="ds-nav-text">Orders</span>
              </NavLink>

              {/* 5. Customers / Users */}
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="ds-nav-text">Customers</span>
              </NavLink>

              {/* 6. Reviews */}
              <NavLink
                to="/admin/reviews"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <span className="ds-nav-text">Reviews</span>
              </NavLink>

              {/* 7. Trash / Recovery */}
              <NavLink
                to="/admin/trash"
                className={({ isActive }) => `ds-nav-link ${isActive ? 'ds-nav-link-active' : ''}`}
                onClick={closeMobile}
              >
                <span className="ds-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </span>
                <span className="ds-nav-text">Trash</span>
                {trashCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#C83226',
                    color: '#fff',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    lineHeight: 1
                  }}>
                    {trashCount}
                  </span>
                )}
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Card & Bottom Controls */}
        <div className="ds-admin-sidebar-footer">
          <div className="ds-sidebar-user-info">
            <div className="ds-sidebar-user-avatar">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user?.name} className="ds-sidebar-user-img" />
              ) : (
                <span>{(user?.name || 'AD')[0].toUpperCase()}</span>
              )}
            </div>
            <div className="ds-sidebar-user-meta">
              <span className="ds-sidebar-user-name">{user?.name || 'Administrator'}</span>
              <span className="ds-sidebar-user-role">Administrator</span>
            </div>
          </div>

          <div className="ds-sidebar-footer-actions">
            <NavLink
              to="/me"
              className="ds-footer-action-btn"
              title="Profile & Settings"
              onClick={closeMobile}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Settings</span>
            </NavLink>

            <button
              type="button"
              className="ds-footer-action-btn ds-footer-logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
