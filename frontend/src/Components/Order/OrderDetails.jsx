import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';
import './Orders.css';

const OrderDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState({});
  const { id } = useParams();

  const getOrderDetails = async (orderId) => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${orderId}`, config);
      setOrder(data.order || {});
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch order dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderDetails(id);
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'bottom-right' });
    }
  }, [error]);

  const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus, createdAt, itemsPrice, shippingPrice, taxPrice } = order || {};

  const orderRef = `#ORD-${String(order?._id || id).slice(-8).toUpperCase()}`;
  const isPaid = paymentInfo && paymentInfo.status === 'succeeded';
  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Order';

  const getStatusClass = (status = '') => {
    const s = String(status).toLowerCase();
    if (s.includes('deliver')) return 'status-delivered';
    if (s.includes('assembl')) return 'status-assembled';
    if (s.includes('process')) return 'status-processing';
    if (s.includes('cancel')) return 'status-cancelled';
    return 'status-processing';
  };

  return (
    <div className="ds-orders-page">
      <MetaData title={`Order Dossier ${orderRef}`} />
      <div className="ds-orders-container">
        {/* Header */}
        <div className="ds-orders-header">
          <div className="ds-orders-eyebrow">ORDER DOSSIER // LOGISTICS & ARCHIVE</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="ds-orders-title">{orderRef}</h1>
            {orderStatus && (
              <span className={`ds-status-badge ${getStatusClass(orderStatus)}`}>
                {orderStatus}
              </span>
            )}
          </div>
          <p className="ds-orders-subtitle">
            Placed on {dateStr} • Official Dosnoventa Atelier fulfillment record.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Loader />
          </div>
        ) : !order || !order._id ? (
          <div className="ds-orders-empty">
            <h3 className="ds-empty-heading">ORDER NOT FOUND</h3>
            <p className="ds-empty-desc">
              We could not locate this order in the archive. It may have been removed or you may need to sign in with a different account.
            </p>
            <Link to="/orders/me" className="ds-btn-gold">
              ← BACK TO MY ORDERS
            </Link>
          </div>
        ) : (
          <>
            <div className="ds-dossier-grid">
              {/* Left Column: Order Items */}
              <div>
                <div className="ds-dossier-card">
                  <h3 className="ds-dossier-heading">DISPATCHED PRODUCTS & SPECIFICATIONS</h3>
                  <div className="ds-order-items-preview">
                    {(orderItems || []).map((item, idx) => (
                      <div key={idx} className="ds-preview-item" style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="ds-preview-left">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="ds-preview-img"
                              style={{ width: '64px', height: '54px' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="ds-preview-info">
                            <Link
                              to={`/product/${item.product}`}
                              className="ds-preview-name"
                              style={{ fontSize: '1rem' }}
                            >
                              {item.name}
                            </Link>
                            <span className="ds-preview-qty">
                              QTY: {item.quantity} × ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className="ds-preview-price" style={{ fontSize: '1rem' }}>
                          ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/orders/me"
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                  }}
                >
                  ← RETURN TO MY ORDERS ARCHIVE
                </Link>
              </div>

              {/* Right Column: Shipping & Summary */}
              <div>
                {/* Shipping Details */}
                <div className="ds-dossier-card">
                  <h3 className="ds-dossier-heading">DISPATCH DESTINATION</h3>
                  <div className="ds-dossier-row">
                    <span className="label">RECIPIENT:</span>
                    <span className="value">{shippingInfo?.recipientName || user?.name || 'Customer'}</span>
                  </div>
                  <div className="ds-dossier-row">
                    <span className="label">CONTACT:</span>
                    <span className="value">{shippingInfo?.phoneNo || 'N/A'}</span>
                  </div>
                  <div className="ds-dossier-row">
                    <span className="label">ADDRESS:</span>
                    <span className="value" style={{ textAlign: 'right', maxWidth: '180px' }}>
                      {shippingInfo?.address || ''}
                    </span>
                  </div>
                  <div className="ds-dossier-row">
                    <span className="label">CITY / REGION:</span>
                    <span className="value">
                      {shippingInfo?.city || ''} {shippingInfo?.province ? `, ${shippingInfo.province}` : ''} {shippingInfo?.postalCode || ''}
                    </span>
                  </div>
                  <div className="ds-dossier-row">
                    <span className="label">COUNTRY:</span>
                    <span className="value">{shippingInfo?.country || ''}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="ds-dossier-card">
                  <h3 className="ds-dossier-heading">PAYMENT & TOTALS</h3>
                  <div className="ds-dossier-row">
                    <span className="label">PAYMENT STATUS:</span>
                    <span className="value" style={{ color: isPaid ? '#10b981' : '#f59e0b' }}>
                      {isPaid ? '✓ PAID VIA STRIPE' : 'PENDING'}
                    </span>
                  </div>
                  {itemsPrice !== undefined && (
                    <div className="ds-dossier-row">
                      <span className="label">ITEMS SUBTOTAL:</span>
                      <span className="value">${Number(itemsPrice).toFixed(2)}</span>
                    </div>
                  )}
                  {shippingPrice !== undefined && (
                    <div className="ds-dossier-row">
                      <span className="label">EXPRESS COURIER:</span>
                      <span className="value">${Number(shippingPrice).toFixed(2)}</span>
                    </div>
                  )}
                  {taxPrice !== undefined && (
                    <div className="ds-dossier-row">
                      <span className="label">SALES TAX:</span>
                      <span className="value">${Number(taxPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <div
                    className="ds-dossier-row"
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.15)',
                      paddingTop: '12px',
                      marginTop: '8px',
                      fontSize: '1rem',
                    }}
                  >
                    <strong style={{ letterSpacing: '1px', fontFamily: 'monospace' }}>GRAND TOTAL:</strong>
                    <strong style={{ color: '#fff', fontSize: '1.25rem', fontFamily: 'monospace' }}>
                      ${Number(totalPrice || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;