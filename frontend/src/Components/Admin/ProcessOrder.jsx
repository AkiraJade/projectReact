import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getAdminConfig, isOrderPaid } from '../../Utils/helpers';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Button } from '@mui/material';

const ProcessOrder = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [order, setOrder] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    const getOrderDetails = async (orderId) => {
        try {
            const config = getAdminConfig();
            const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${orderId}`, config);
            setOrder(data.order || {});
            setStatus(data.order?.orderStatus || 'Processing');
            setLoading(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message, { position: 'bottom-right' });
            setLoading(false);
        }
    };

    const updateOrderHandler = async () => {
        if (!status) return;
        setUpdating(true);
        try {
            const config = getAdminConfig();
            config.headers = {
                ...config.headers,
                'Content-Type': 'application/json'
            };
            const { data } = await axios.put(
                `${import.meta.env.VITE_API}/admin/order/${id}`,
                { status },
                config
            );
            if (data.success) {
                toast.success('Order status updated. Invoice PDF & email notification sent to customer!', {
                    position: 'bottom-right'
                });
                getOrderDetails(id);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message, { position: 'bottom-right' });
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        getOrderDetails(id);
    }, [id]);

    const isPaid = isOrderPaid(order?.paymentInfo?.status);
    const shippingInfo = order?.shippingInfo;
    const shippingDetails = shippingInfo
        ? `${shippingInfo.address || ''}, ${shippingInfo.city || ''}, ${shippingInfo.postalCode || ''}, ${shippingInfo.country || ''}`
        : 'N/A';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MetaData title={`Fulfillment — Order #${order?._id || ''}`} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                color: '#374151',
                                borderColor: '#D1D5DB',
                                backgroundColor: '#FFFFFF',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '13px',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                '&:hover': { borderColor: '#111827', color: '#111827', backgroundColor: '#F9FAFB' }
                            }}
                        >
                            Orders
                        </Button>
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, fontFamily: 'monospace' }}>
                                #ORD-{String(order?._id || id).slice(-8).toUpperCase()}
                            </h2>
                            <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: isPaid ? '#D1FAE5' : '#FEF3C7',
                                color: isPaid ? '#065F46' : '#92400E',
                                border: `1px solid ${isPaid ? '#A7F3D0' : '#FDE68A'}`
                            }}>
                                {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                            Internal Reference: <code style={{ color: '#374151' }}>{order?._id || id}</code>
                        </span>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #EAECF0',
                    fontSize: '12.5px',
                    color: '#4B5563',
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)'
                }}>
                    <EmailIcon fontSize="small" sx={{ color: '#059669' }} />
                    <span>Auto-Dispatches PDF Receipt to: <strong style={{ color: '#111827' }}>{order?.user?.email || 'Customer'}</strong></span>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.1fr', gap: '24px', alignItems: 'start' }}>
                    {/* Left: Customer Info & Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Summary & Shipping Card */}
                        <div className="ds-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111827', margin: '0 0 16px 0', fontWeight: 700 }}>
                                Customer & Shipping Destination
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', fontSize: '13.5px' }}>
                                <div>
                                    <span style={{ display: 'block', color: '#6B7280', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Customer Name</span>
                                    <span style={{ color: '#111827', fontWeight: 600 }}>{order?.user?.name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', color: '#6B7280', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Email Address</span>
                                    <span style={{ color: '#111827' }}>{order?.user?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', color: '#6B7280', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Contact Phone</span>
                                    <span style={{ color: '#111827' }}>{shippingInfo?.phoneNo || 'N/A'}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', color: '#6B7280', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Delivery Address</span>
                                    <span style={{ color: '#111827', lineHeight: '1.4' }}>{shippingDetails}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="ds-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111827', margin: 0, fontWeight: 700 }}>
                                    Line Items
                                </h3>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                    {order?.orderItems?.length || 0} product(s)
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(order?.orderItems || []).map((item) => (
                                    <div
                                        key={item.product}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '14px 16px',
                                            background: '#F9FAFB',
                                            border: '1px solid #EAECF0',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: '52px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}
                                            />
                                            <div>
                                                <Link to={`/product/${item.product}`} style={{ color: '#111827', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                                                    {item.name}
                                                </Link>
                                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                                                    Unit Price: ${Number(item.price).toFixed(2)} × Qty: {item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: '#111827', fontSize: '14.5px', fontFamily: 'monospace' }}>
                                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Fulfillment Workflow & Ledger */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Status Management */}
                        <div className="ds-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111827', margin: '0 0 16px 0', fontWeight: 700 }}>
                                Fulfillment Workflow
                            </h3>

                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '11.5px', color: '#4B5563', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                                    Current Fulfillment Stage:
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        background: '#FFFFFF',
                                        border: '1.5px solid #D1D5DB',
                                        borderRadius: '8px',
                                        color: '#111827',
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Processing">Processing (Atelier queue)</option>
                                    <option value="Assembled">Assembled (Ready for dispatch)</option>
                                    <option value="Delivered">Delivered (Finalized / Archive)</option>
                                    <option value="Cancelled">Cancelled (Order voided)</option>
                                </select>
                            </div>

                            <Button
                                variant="contained"
                                fullWidth
                                disabled={updating || status === order?.orderStatus}
                                onClick={updateOrderHandler}
                                sx={{
                                    background: '#C83226',
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    padding: '12px',
                                    fontSize: '12.5px',
                                    borderRadius: '8px',
                                    boxShadow: 'none',
                                    '&:hover': { background: '#B3261B', boxShadow: 'none' },
                                    '&:disabled': { background: '#E5E7EB', color: '#9CA3AF' }
                                }}
                            >
                                {updating ? 'Updating & Generating PDF...' : 'Update Order Status'}
                            </Button>

                            <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '14px 0 0', lineHeight: '1.5' }}>
                                Changing the status automatically triggers an updated Dosnoventa PDF receipt dispatch to the rider's email.
                            </p>
                        </div>

                        {/* Financial Ledger Breakdown */}
                        <div className="ds-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111827', margin: '0 0 16px 0', fontWeight: 700 }}>
                                Accounting Ledger
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Items Subtotal:</span>
                                    <span style={{ fontFamily: 'monospace', color: '#111827' }}>${Number(order?.itemsPrice || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Shipping (Air Freight):</span>
                                    <span style={{ fontFamily: 'monospace', color: '#111827' }}>${Number(order?.shippingPrice || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                                    <span>Tax:</span>
                                    <span style={{ fontFamily: 'monospace', color: '#111827' }}>${Number(order?.taxPrice || 0).toFixed(2)}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: '14px',
                                    marginTop: '6px',
                                    borderTop: '1px solid #EAECF0',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#111827'
                                }}>
                                    <span>Grand Total:</span>
                                    <span style={{ fontFamily: 'monospace', color: '#111827' }}>${Number(order?.totalPrice || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessOrder;