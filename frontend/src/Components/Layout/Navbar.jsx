import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../actions/userActions';
import './Navbar.css';

const Navbar = ({ cartItems = [] }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ds_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ds_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const cartCount = cartItems ? cartItems.length : 0;

  return (
    <>
      <header className={`ds-navbar ${scrolled ? 'ds-navbar-scrolled' : ''}`}>
        <div className="ds-navbar-container">
          {/* LEFT: DOSNOVENTA wordmark */}
          <div className="ds-navbar-brand">
            <Link to="/" className="ds-logo-link">
              <span className="ds-brand-name">DOSNOVENTA</span>
            </Link>
          </div>

          {/* CENTER: SHOP, STORIES, COMPANY */}
          <nav className="ds-navbar-links" aria-label="Main Navigation">
            <Link to="/shop" className="ds-nav-item">
              <span className="ds-nav-label">SHOP</span>
            </Link>
            <Link to="/stories" className="ds-nav-item">
              <span className="ds-nav-label">STORIES</span>
            </Link>
            <Link to="/company" className="ds-nav-item">
              <span className="ds-nav-label">COMPANY</span>
            </Link>
          </nav>

          {/* RIGHT: LOGIN / USER & CART */}
          <div className="ds-navbar-actions">
            {user ? (
              <div
                className={`ds-user-dropdown ${userMenuOpen ? 'is-active' : ''}`}
                tabIndex={0}
                role="button"
                aria-haspopup="true"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="ds-nav-user-pill">
                  <div className="ds-nav-avatar-box">
                    <img
                      src={user.avatar?.url || 'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png'}
                      alt={user.name}
                      className="ds-nav-avatar-img"
                    />
                  </div>
                  <span className="ds-user-name">{user.name?.split(' ')[0]}</span>
                </div>
                <div className="ds-user-menu" role="menu">
                  {user.role === 'admin' && (
                    <Link to="/dashboard" className="ds-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                  )}
                  <Link to="/orders/me" className="ds-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Orders</Link>
                  <Link to="/me" className="ds-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                  <Link to="/me/addresses" className="ds-menu-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Addresses</Link>
                  <button onClick={handleLogout} className="ds-menu-item ds-logout-btn" role="menuitem">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="ds-nav-auth">
                LOGIN
              </Link>
            )}

            <Link to="/cart" className="ds-nav-cart" aria-label="Shopping Cart">
              <span className="ds-cart-label">CART</span>
              <span className="ds-cart-divider">/</span>
              <span className="ds-cart-count">
                {String(cartCount).padStart(2, '0')}
              </span>
            </Link>

            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              type="button"
              className="ds-theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                /* Moon icon for Dark Mode */
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                /* Sun icon for Light Mode */
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className={`ds-mobile-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="ds-toggle-bar"></span>
              <span className="ds-toggle-bar"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`ds-mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="ds-mobile-drawer-inner">
          <div className="ds-mobile-links">
            <Link to="/shop" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              SHOP
            </Link>
            <Link to="/stories" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              STORIES
            </Link>
            <Link to="/company" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              COMPANY
            </Link>
          </div>

          <div className="ds-mobile-footer">
            {user ? (
              <div className="ds-mobile-user">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <img
                    src={user.avatar?.url || 'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png'}
                    alt={user.name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <span>RIDER: {user.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <Link to="/me" className="ds-btn ds-btn-outline ds-btn-sm" onClick={() => setMobileMenuOpen(false)}>
                    PROFILE
                  </Link>
                  <Link to="/me/addresses" className="ds-btn ds-btn-outline ds-btn-sm" onClick={() => setMobileMenuOpen(false)}>
                    ADDRESSES
                  </Link>
                  <Link to="/orders/me" className="ds-btn ds-btn-outline ds-btn-sm" onClick={() => setMobileMenuOpen(false)}>
                    ORDERS
                  </Link>
                </div>
                <button onClick={handleLogout} className="ds-btn ds-btn-outline ds-btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="ds-mobile-auth-group">
                <Link to="/login" className="ds-btn ds-btn-outline" onClick={() => setMobileMenuOpen(false)}>
                  LOGIN
                </Link>
                <Link to="/register" className="ds-btn" onClick={() => setMobileMenuOpen(false)}>
                  JOIN THE BROTHERHOOD
                </Link>
              </div>
            )}
            <div className="ds-mobile-city-tag">
              BARCELONA / TOKYO / LA / OSAKA
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
