import React, { useState, useEffect } from 'react';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const Analytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [customerSales, setCustomerSales] = useState([]);
  const [selectedRange, setSelectedRange] = useState('30D'); // '7D' | '30D' | '90D'
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Fetch range sales
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
      setSalesData(items);

      const rev = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      const ords = items.reduce((acc, curr) => acc + (Number(curr.orders) || 0), 0);
      setTotalRevenue(rev);
      setTotalOrders(ords);

      setChartLoading(false);
    } catch (err) {
      console.error('Error fetching sales analytics:', err);
      setChartLoading(false);
    }
  };

  // Fetch top customers
  const fetchCustomerSales = async () => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/admin/customer-sales`,
        config
      );
      setCustomerSales(data.customerSales || []);
    } catch (err) {
      console.error('Error fetching customer sales:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRangeSales(selectedRange), fetchCustomerSales()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchRangeSales(selectedRange);
  }, [selectedRange]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <MetaData title="Sales Analytics & Trends — DOSNOVENTA" />

      {/* Analytics Summary Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{
          background: '#16181A',
          border: '1px solid #282A2E',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF' }}>
            Period Revenue ({selectedRange})
          </span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#F9FAFB', marginTop: '6px' }}>
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{
          background: '#16181A',
          border: '1px solid #282A2E',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF' }}>
            Orders Placed ({selectedRange})
          </span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#F9FAFB', marginTop: '6px' }}>
            {totalOrders}
          </div>
        </div>

        <div style={{
          background: '#16181A',
          border: '1px solid #282A2E',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF' }}>
            Average Order Value
          </span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#F9FAFB', marginTop: '6px' }}>
            ${totalOrders > 0 ? (totalRevenue / totalOrders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div style={{
        background: '#16181A',
        border: '1px solid #282A2E',
        borderRadius: '8px',
        padding: '24px'
      }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F9FAFB', margin: 0 }}>
              REVENUE & SALES VOLUME
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>
              Historical timeline of completed customer checkouts
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Chart Type Toggle */}
            <div style={{ display: 'flex', background: '#0D0E10', border: '1px solid #282A2E', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setChartType('line')}
                style={{
                  border: 'none',
                  background: chartType === 'line' ? '#C83226' : 'transparent',
                  color: chartType === 'line' ? '#fff' : '#9CA3AF',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Line Chart
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                style={{
                  border: 'none',
                  background: chartType === 'bar' ? '#C83226' : 'transparent',
                  color: chartType === 'bar' ? '#fff' : '#9CA3AF',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Bar Chart
              </button>
            </div>

            {/* Range Toggle */}
            <div style={{ display: 'flex', background: '#0D0E10', border: '1px solid #282A2E', borderRadius: '6px', padding: '2px' }}>
              {['7D', '30D', '90D'].map((rangeKey) => (
                <button
                  key={rangeKey}
                  type="button"
                  onClick={() => setSelectedRange(rangeKey)}
                  style={{
                    border: 'none',
                    background: selectedRange === rangeKey ? '#282A2E' : 'transparent',
                    color: selectedRange === rangeKey ? '#F9FAFB' : '#9CA3AF',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {rangeKey}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div style={{ width: '100%', height: '340px' }}>
          {chartLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#9CA3AF', fontSize: '13px' }}>
              Loading analytics window...
            </div>
          ) : salesData.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6B7280', fontSize: '13px' }}>
              No sales transactions recorded for this {selectedRange} period.
            </div>
          ) : chartType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#282A2E" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{ background: '#0D0E10', border: '1px solid #374151', borderRadius: '6px', padding: '10px 14px' }}>
                          <div style={{ color: '#9CA3AF', fontSize: '11px' }}>{label}</div>
                          <div style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>
                            ${Number(payload[0].value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  dot={{ r: 3, fill: '#C83226' }}
                  activeDot={{ r: 6, fill: '#C83226', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#282A2E" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{ background: '#0D0E10', border: '1px solid #374151', borderRadius: '6px', padding: '10px 14px' }}>
                          <div style={{ color: '#9CA3AF', fontSize: '11px' }}>{label}</div>
                          <div style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>
                            ${Number(payload[0].value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="total" fill="#C83226" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Customers Breakdown */}
      {customerSales.length > 0 && (
        <div style={{
          background: '#16181A',
          border: '1px solid #282A2E',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 16px 0' }}>
            TOP RIDERS BY LIFETIME VALUE
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {customerSales.slice(0, 6).map((cs, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#0D0E10',
                  border: '1px solid #282A2E',
                  borderRadius: '6px'
                }}
              >
                <div>
                  <div style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '13px' }}>
                    {cs.userDetails?.name || 'Rider'}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px' }}>Verified Customer</div>
                </div>
                <div style={{ color: '#10B981', fontWeight: 700, fontSize: '14px' }}>
                  ${Number(cs.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
