import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PublicLayout: Wraps customer-facing storefront pages with the
 * DOSNOVENTA single-row navbar and footer.
 */
const PublicLayout = ({ cartItems = [] }) => {
  return (
    <div className="ds-public-shell">
      <Navbar cartItems={cartItems} />
      <main className="ds-public-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
