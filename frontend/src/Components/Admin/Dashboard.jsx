import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [rangeSalesData, setRangeSalesData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('30D'); // '7D' | '30D' | '90D'
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch base dashboard data: products, orders, and users
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const config = getAdminConfig();

      const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API}/admin/products`, config),
        axios.get(`${import.meta.env.VITE_API}/admin/orders`, config),
        axios.get(`${import.meta.env.VITE_API}/admin/users`, config),
      ]);

      const prods = productsRes.status === 'fulfilled' ? productsRes.value.data.products || [] : [];
      const ords = ordersRes.status === 'fulfilled' ? ordersRes.value.data.orders || [] : [];
      const usrs = usersRes.status === 'fulfilled' ? usersRes.value.data.users || [] : [];

      setProducts(prods);
      setOrders(ords);
      setUsers(usrs);

      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  // 2. Fetch range-specific sales data for the chart
  const fetchRangeSales = async (rangeKey) => {
    try {
      setChartLoading(true);
      const config = getAdminConfig();
      const daysMap = { '7D': 7, '30D': 30, '90D': 90 };
      const days = daysMap[rangeKey] || 30;

      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/admin/sales-per-month?days=${days}`,
        config
      );

      const items = data.salesData || data.salesPerMonth || [];
      setRangeSalesData(items);
      setChartLoading(false);
    } catch (err) {
      console.error('Error fetching sales range data:', err);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchRangeSales(selectedRange);
  }, [selectedRange]);

  // Gross sales and key metrics calculation
  const { grossSales, activeOrdersCount, averageOrderValue, outOfStockCount } = useMemo(() => {
    const active = orders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalSales = active.reduce((acc, o) => acc + (Number(o.totalPrice) || 0), 0);
    const avg = active.length > 0 ? totalSales / active.length : 0;
    const outOfStock = products.filter((p) => Number(p.stock) === 0).length;

    return {
      grossSales: totalSales,
      activeOrdersCount: active.length,
      averageOrderValue: avg,
      outOfStockCount: outOfStock,
    };
  }, [orders, products]);

  // Sparkline data for Gross Sales card
  const sparklineData = useMemo(() => {
    if (rangeSalesData && rangeSalesData.length > 0) {
      return rangeSalesData.map((d, index) => ({ id: index, val: d.total }));
    }
    // Fallback minimal points from orders
    return [
      { id: 1, val: 0 },
      { id: 2, val: grossSales * 0.4 },
      { id: 3, val: grossSales * 0.7 },
      { id: 4, val: grossSales },
    ];
  }, [rangeSalesData, grossSales]);

  // Recent 5 orders
  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <MetaData title="Atelier Dashboard — DOSNOVENTA" />

      {/* SECTION 1: MAIN METRICS GRID */}
      <div className="ds-dashboard-grid">
        {/* Left: Large Primary Gross Sales Card */}
        <div className="ds-card ds-card-primary-sales">
          <div>
            <div className="ds-card-label">Gross sales</div>
            <div className="ds-metric-hero-value">
              ${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="ds-metric-subtext">Selected period</div>

            {/* Compact sparkline */}
            <div className="ds-sparkline-wrap">
              <ResponsiveContainer width="100%" height={48}>
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke="#C83226"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <hr className="ds-card-divider" />
            <div className="ds-supporting-metrics-row">
              <div className="ds-sub-metric">
                <div className="ds-sub-metric-label">Orders</div>
                <div className="ds-sub-metric-val">{activeOrdersCount}</div>
              </div>
              <div className="ds-sub-metric">
                <div className="ds-sub-metric-label">Average order</div>
                <div className="ds-sub-metric-val">
                  ${averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Three Stacked Supporting Metric Cards */}
        <div className="ds-cards-stack">
          {/* Card 1: Total Orders */}
          <div className="ds-card ds-stacked-card">
            <div className="ds-stacked-card-header">
              <span className="ds-card-label">Total orders</span>
              <span className="ds-stacked-card-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
            </div>
            <div className="ds-stacked-card-val">{orders.length}</div>
          </div>

          {/* Card 2: Published Products */}
          <div className="ds-card ds-stacked-card">
            <div className="ds-stacked-card-header">
              <span className="ds-card-label">Published products</span>
              <span className="ds-stacked-card-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21 8-9-5-9 5 9 5 9-5z" />
                  <path d="M3 8v8l9 5 9-5V8" />
                  <path d="M12 13v8" />
                </svg>
              </span>
            </div>
            <div className="ds-stacked-card-val">{products.length}</div>
            {outOfStockCount > 0 && (
              <span className="ds-pill-alert ds-pill-amber">
                {outOfStockCount} out of stock
              </span>
            )}
          </div>

          {/* Card 3: Customers */}
          <div className="ds-card ds-stacked-card">
            <div className="ds-stacked-card-header">
              <span className="ds-card-label">Customers</span>
              <span className="ds-stacked-card-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
            </div>
            <div className="ds-stacked-card-val">{users.length}</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SALES OVERVIEW (REVENUE LINE CHART) */}
      <div className="ds-card ds-chart-card">
        <div className="ds-chart-header">
          <div>
            <h2 className="ds-chart-title">Sales overview</h2>
            <p className="ds-chart-subtitle">Revenue over time</p>
          </div>

          {/* 7D / 30D / 90D Range Control */}
          <div className="ds-range-control" role="group" aria-label="Sales Range Filter">
            {['7D', '30D', '90D'].map((rangeKey) => (
              <button
                key={rangeKey}
                type="button"
                className={`ds-range-btn ${selectedRange === rangeKey ? 'ds-range-btn-active' : ''}`}
                onClick={() => setSelectedRange(rangeKey)}
              >
                {rangeKey}
              </button>
            ))}
          </div>
        </div>

        <div className="ds-chart-container">
          {chartLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted small">
              Updating analytics...
            </div>
          ) : rangeSalesData.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted small">
              No sales recorded for the selected {selectedRange} window.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={rangeSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="ds-chart-tooltip">
                          <div className="ds-chart-tooltip-date">{label}</div>
                          <div className="ds-chart-tooltip-val">
                            ${Number(payload[0].value || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#C83226"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#C83226', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SECTION 3: RECENT ORDERS TABLE */}
      <div className="ds-card ds-orders-card">
        <div className="ds-orders-header">
          <h2 className="ds-orders-title">Recent orders</h2>
          <Link to="/admin/orders" className="ds-orders-view-all">
            View all &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-muted small py-3 mb-0">No orders received yet.</p>
        ) : (
          <div className="ds-orders-list">
            {recentOrders.map((order) => {
              const code = `#ORD-${order._id.slice(-5).toUpperCase()}`;
              const customerName = order.user?.name || order.shippingInfo?.city || 'Customer order';
              const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              // Status class mapping
              const statusClass = {
                Processing: 'ds-status-processing',
                Assembled: 'ds-status-assembled',
                Delivered: 'ds-status-delivered',
                Cancelled: 'ds-status-cancelled',
              }[order.orderStatus] || 'ds-status-processing';

              return (
                <div key={order._id} className="ds-order-row">
                  <div className="ds-order-row-left">
                    <div className="ds-order-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="ds-order-meta">
                      <Link to={`/admin/order/${order._id}`} className="ds-order-code">
                        {code}
                      </Link>
                      <span className="ds-order-customer">{customerName}</span>
                    </div>
                  </div>

                  <div className="ds-order-row-right">
                    <span className="ds-order-date">{dateStr}</span>
                    <span className="ds-order-amount">
                      ${Number(order.totalPrice || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className={`ds-status-pill ${statusClass}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;