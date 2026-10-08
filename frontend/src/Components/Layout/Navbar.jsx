import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../actions/userActions';
import './Navbar.css';

const Navbar = ({ cartItems = [] }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

          {/* CENTER: BIKES, WORLD, STORIES, SHOP */}
          <nav className="ds-navbar-links" aria-label="Main Navigation">
            <Link to="/#bikes" className="ds-nav-item">
              <span className="ds-nav-label">BIKES</span>
            </Link>
            <Link to="/#world" className="ds-nav-item">
              <span className="ds-nav-label">WORLD</span>
            </Link>
            <Link to="/#stories" className="ds-nav-item">
              <span className="ds-nav-label">STORIES</span>
            </Link>
            <Link to="/#catalog" className="ds-nav-item">
              <span className="ds-nav-label">SHOP</span>
            </Link>
          </nav>

          {/* RIGHT: LOGIN / USER & CART */}
          <div className="ds-navbar-actions">
            {user ? (
              <div className="ds-user-dropdown" tabIndex={0} role="button" aria-haspopup="true">
                <span className="ds-user-name">{user.name?.split(' ')[0]}</span>
                <div className="ds-user-menu" role="menu">
                  {user.role === 'admin' && (
                    <Link to="/dashboard" className="ds-menu-item" role="menuitem">Dashboard</Link>
                  )}
                  <Link to="/orders/me" className="ds-menu-item" role="menuitem">Orders</Link>
                  <Link to="/me" className="ds-menu-item" role="menuitem">Profile</Link>
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
            <Link to="/#bikes" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              BIKES
            </Link>
            <Link to="/#world" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              WORLD
            </Link>
            <Link to="/#stories" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              STORIES
            </Link>
            <Link to="/#catalog" className="ds-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              SHOP
            </Link>
          </div>

          <div className="ds-mobile-footer">
            {user ? (
              <div className="ds-mobile-user">
                <span>RIDER: {user.name}</span>
                <button onClick={handleLogout} className="ds-btn ds-btn-outline ds-btn-sm mt-3">
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
