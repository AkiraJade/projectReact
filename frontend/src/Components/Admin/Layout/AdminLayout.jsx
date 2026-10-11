import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Route-aware titles
  const getHeaderInfo = (pathname) => {
    if (pathname === '/admin' || pathname === '/dashboard') {
      return {
        title: 'Overview',
        subtitle: 'Store performance and operations',
      };
    }
    if (pathname === '/admin/products') {
      return {
        title: 'Products',
        subtitle: 'Manage frames, bikes, and atelier inventory',
      };
    }
    if (pathname === '/admin/product') {
      return {
        title: 'Add Product',
        subtitle: 'Configure and publish a new catalog item',
      };
    }
    if (pathname.startsWith('/admin/product/')) {
      return {
        title: 'Edit Product',
        subtitle: 'Update item specifications, pricing, and stock',
      };
    }
    if (pathname === '/admin/orders') {
      return {
        title: 'Orders',
        subtitle: 'Customer orders and fulfillment management',
      };
    }
    if (pathname.startsWith('/admin/order/')) {
      return {
        title: 'Order Fulfillment',
        subtitle: 'Review dispatch status and order line items',
      };
    }
    if (pathname === '/admin/users' || pathname.startsWith('/admin/user/')) {
      return {
        title: 'Customers',
        subtitle: 'Registered riders and atelier accounts',
      };
    }
    if (pathname === '/admin/reviews') {
      return {
        title: 'Product Reviews',
        subtitle: 'Moderate verified rider ratings and feedback',
      };
    }
    return {
      title: 'Atelier Console',
      subtitle: 'Administration and operations',
    };
  };

  const { title, subtitle } = getHeaderInfo(location.pathname);

  return (
    <div className="ds-admin-shell">
      {/* 1. Slim Left Icon-Only Rail */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* 2. Main Content Area */}
      <div className="ds-admin-main">
        {/* Top Header */}
        <AdminHeader 
          title={title} 
          subtitle={subtitle} 
          onToggleMobile={() => setMobileOpen(prev => !prev)} 
        />

        {/* Page Content Viewport */}
        <main className="ds-admin-content-pane">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
