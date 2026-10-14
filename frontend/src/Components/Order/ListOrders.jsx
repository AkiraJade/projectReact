import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';
import './Orders.css';

const ListOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myOrdersList, setMyOrdersList] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const fetchMyOrders = async () => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config);
      if (data && Array.isArray(data.orders)) {
        setMyOrdersList(data.orders);
      } else {
        setMyOrdersList([]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to retrieve orders';
      setError(msg);
      setMyOrdersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'bottom-right' });
    }
  }, [error]);

  const getStatusClass = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('deliver')) return 'status-delivered';
    if (s.includes('assembl')) return 'status-assembled';
    if (s.includes('process')) return 'status-processing';
    if (s.includes('cancel')) return 'status-cancelled';
    return 'status-processing';
  };

  // MUI DataGrid column definitions
  const columns = [
    {
      field: 'id',
      headerName: 'Order Reference',
      flex: 1.2,
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f6f5f1' }}>
          #ORD-{String(params.value).slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      field: 'numOfItems',
      headerName: 'Items',
      type: 'number',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'amount',
      headerName: 'Total',
      width: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{params.value}</strong>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <span className={`ds-status-badge ${getStatusClass(params.value)}`}>
          {params.value || 'Processing'}
        </span>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 140,
      renderCell: (params) => (
        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Dossier',
      width: 120,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Link
          to={`/order/${params.id}`}
          style={{
            color: '#f6f5f1',
            textDecoration: 'none',
            fontSize: '11px',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            padding: '4px 8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
          }}
        >
          VIEW →
        </Link>
      ),
    },
  ];

  const rows = (myOrdersList || []).map((order) => ({
    id: order._id,
    numOfItems: order.orderItems ? order.orderItems.length : 0,
    amount: `$${Number(order.totalPrice || 0).toFixed(2)}`,
    status: order.orderStatus || 'Processing',
    date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A',
  }));

  return (
    <div className="ds-orders-page">
      <MetaData title="My Orders & Dispatches" />
      <div className="ds-orders-container">
        {/* Header */}
        <div className="ds-orders-header">
          <div className="ds-orders-eyebrow">MEMBER ARCHIVE // TRANSACTION LOG</div>
          <h1 className="ds-orders-title">MY ORDERS</h1>
          <p className="ds-orders-subtitle">
            Track assembly progress, frame fabrication notes, and worldwide courier tracking for your Dosnoventa machines.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Loader />
          </div>
        ) : myOrdersList.length === 0 ? (
          /* Empty State */
          <div className="ds-orders-empty">
            <span className="ds-empty-glyph">🚲</span>
            <h3 className="ds-empty-heading">NO ORDERS IN YOUR ARCHIVE</h3>
            <p className="ds-empty-desc">
              You haven't placed any orders with Dosnoventa yet. Browse our handmade Italian Columbus steel framesets and complete track builds in the collection.
            </p>
            <Link to="/shop" className="ds-btn-gold">
              EXPLORE THE COLLECTION →
            </Link>
          </div>
        ) : (
          /* Orders Found */
          <>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  background: viewMode === 'cards' ? '#f6f5f1' : 'transparent',
                  color: viewMode === 'cards' ? '#0c0d0e' : '#f6f5f1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '6px 14px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                CARDS VIEW
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? '#f6f5f1' : 'transparent',
                  color: viewMode === 'table' ? '#0c0d0e' : '#f6f5f1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '6px 14px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                DATATABLE VIEW
              </button>
            </div>

            {viewMode === 'cards' ? (
              <div className="ds-orders-list">
                {myOrdersList.map((order) => {
                  const orderRef = `#ORD-${String(order._id).slice(-8).toUpperCase()}`;
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recent Order';

                  return (
                    <div key={order._id} className="ds-order-card">
                      <div className="ds-card-top">
                        <div className="ds-order-meta">
                          <span className="ds-order-ref">{orderRef}</span>
                          <span className="ds-order-date">{dateStr}</span>
                        </div>
                        <span className={`ds-status-badge ${getStatusClass(order.orderStatus)}`}>
                          {order.orderStatus || 'Processing'}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="ds-order-items-preview">
                        {(order.orderItems || []).map((item, idx) => (
                          <div key={idx} className="ds-preview-item">
                            <div className="ds-preview-left">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="ds-preview-img"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="ds-preview-info">
                                <Link to={`/product/${item.product}`} className="ds-preview-name">
                                  {item.name}
                                </Link>
                                <span className="ds-preview-qty">QUANTITY: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="ds-preview-price">
                              ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="ds-card-bottom">
                        <div className="ds-order-total">
                          ORDER TOTAL:
                          <strong>${Number(order.totalPrice || 0).toFixed(2)}</strong>
                        </div>
                        <Link to={`/order/${order._id}`} className="ds-view-order-btn">
                          VIEW ORDER DOSSIER →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* DataGrid Table View (ITCP318 datatables requirement) */
              <Box
                sx={{
                  width: '100%',
                  minHeight: 400,
                  background: '#141618',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  p: 2,
                  mb: 4,
                  '& .MuiDataGrid-root': {
                    border: 'none',
                    color: '#f6f5f1',
                    fontFamily: 'inherit',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#0c0d0e',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f6f5f1',
                  },
                  '& .MuiTablePagination-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#f6f5f1',
                  },
                }}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  disableRowSelectionOnClick
                  autoHeight
                />
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListOrders;