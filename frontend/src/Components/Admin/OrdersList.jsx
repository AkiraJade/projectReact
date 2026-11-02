import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Chip, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { getAdminConfig } from '../../Utils/helpers';
import { exportToCsv } from '../../Utils/exportCsv';
import axios from 'axios';

const OrdersList = () => {
    let navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allOrders, setAllOrders] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    const listOrders = async () => {
        try {
            const config = getAdminConfig();
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config);
            setAllOrders(data.orders || []);
            setLoading(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message, { position: 'bottom-right' });
            setLoading(false);
        }
    };

    const deleteOrderHandler = async (id, status) => {
        if (status === 'Delivered') {
            toast.error('Completed & delivered transactions cannot be deleted to preserve accounting integrity.', {
                position: 'bottom-right'
            });
            return;
        }

        if (!window.confirm('Are you sure you want to cancel and remove this unfulfilled order? This cannot be undone.')) {
            return;
        }

        setDeletingId(id);
        try {
            const config = getAdminConfig();
            const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config);
            if (data.success) {
                toast.success('Order deleted successfully', { position: 'bottom-right' });
                listOrders();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete order', { position: 'bottom-right' });
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        listOrders();
    }, []);

    const getStatusChip = (status) => {
        const statusMap = {
            Processing: { className: 'ds-badge-warning', label: 'Processing' },
            Assembled: { className: 'ds-badge-info', label: 'Assembled' },
            Delivered: { className: 'ds-badge-success', label: 'Delivered' },
            Cancelled: { className: 'ds-badge-danger', label: 'Cancelled' }
        };
        const s = statusMap[status] || { className: 'ds-badge-neutral', label: status || 'Pending' };

        return (
            <span className={`ds-table-badge ${s.className}`}>
                <span className="ds-table-badge-dot"></span>
                {s.label}
            </span>
        );
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Order Reference',
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.3', height: '100%' }}>
                    <span style={{
                        fontFamily: 'var(--ds-font-grotesk, sans-serif)',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#101828',
                        letterSpacing: '0.04em'
                    }}>
                        #ORD-{String(params.value).slice(-8).toUpperCase()}
                    </span>
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#667085',
                        letterSpacing: '0.02em',
                        marginTop: '2px'
                    }}>
                        {params.value}
                    </span>
                </div>
            )
        },
        {
            field: 'customer',
            headerName: 'Customer',
            flex: 1.2,
            minWidth: 160,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', lineHeight: 1.3 }}>
                    <span style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--ds-admin-text-main, #101828)'
                    }}>
                        {params.value}
                    </span>
                    {params.row.destination && (
                        <span style={{
                            fontSize: '11px',
                            color: 'var(--ds-admin-text-muted, #667085)',
                            marginTop: '2px'
                        }}>
                            📍 {params.row.destination}
                        </span>
                    )}
                </div>
            )
        },
        {
            field: 'numofItems',
            headerName: 'Items',
            width: 90,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <span style={{
                    fontWeight: 600,
                    color: '#344054',
                    fontFamily: 'var(--ds-font-grotesk, sans-serif)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '13px'
                }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'amount',
            headerName: 'Grand Total',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <span style={{
                    fontWeight: 700,
                    color: '#101828',
                    fontSize: '14px',
                    fontFamily: 'var(--ds-font-grotesk, sans-serif)',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    ${Number(params.value).toFixed(2)}
                </span>
            )
        },
        {
            field: 'status',
            headerName: 'Fulfillment Status',
            width: 180,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => getStatusChip(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 210,
            sortable: false,
            filterable: false,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
                    <Link to={`/admin/order/${params.row.rawId}`} className="ds-table-action-btn ds-table-btn-view">
                        <VisibilityIcon style={{ fontSize: '13px' }} />
                        Process
                    </Link>
                    {params.row.status !== 'Delivered' && (
                        <button
                            type="button"
                            disabled={deletingId === params.row.rawId}
                            onClick={() => deleteOrderHandler(params.row.rawId, params.row.status)}
                            className="ds-table-action-btn ds-table-btn-trash"
                            title="Cancel / delete unfulfilled order"
                        >
                            <DeleteOutlineIcon style={{ fontSize: '13px' }} />
                            Cancel
                        </button>
                    )}
                </div>
            )
        }
    ];

    const rows = allOrders.map((order) => {
        const customerName = (typeof order.user === 'object' && order.user?.name)
            ? order.user.name
            : (order.shippingInfo?.recipientName || order.shippingInfo?.name || 'Guest Rider');
        const customerEmail = typeof order.user === 'object' ? order.user?.email : '';
        const destination = [order.shippingInfo?.city, order.shippingInfo?.country].filter(Boolean).join(', ');

        return {
            id: order._id,
            rawId: order._id,
            customer: customerName,
            customerEmail: customerEmail,
            destination: destination,
            numofItems: order.orderItems?.length || 0,
            amount: order.totalPrice,
            status: order.orderStatus,
        };
    });

    const handleExportCSV = () => {
        const exportColumns = [
            { label: 'Order Reference', key: (o) => `#ORD-${String(o._id).slice(-8).toUpperCase()}` },
            { label: 'Order ID', key: '_id' },
            { label: 'Customer Name', key: (o) => o.user?.name || o.shippingInfo?.recipientName || 'Guest Rider' },
            { label: 'Customer Email', key: (o) => o.user?.email || '' },
            { label: 'Items Count', key: (o) => o.orderItems?.length || 0 },
            { label: 'Items Detail', key: (o) => (o.orderItems || []).map(i => `${i.name} (x${i.quantity})`).join('; ') },
            { label: 'Total Amount ($)', key: (o) => Number(o.totalPrice || 0).toFixed(2) },
            { label: 'Fulfillment Status', key: (o) => o.orderStatus || 'Processing' },
            { label: 'Payment Status', key: (o) => o.paymentInfo?.status || 'Paid' },
            { label: 'Shipping City', key: (o) => o.shippingInfo?.city || '' },
            { label: 'Shipping Country', key: (o) => o.shippingInfo?.country || '' },
            { label: 'Order Date', key: (o) => o.createdAt ? new Date(o.createdAt).toLocaleString() : '' },
        ];
        exportToCsv('orders_fulfillment', exportColumns, allOrders);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MetaData title="Orders & Fulfillment — DOSNOVENTA" />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', margin: 0 }}>
                        Orders & Fulfillment
                    </h2>
                    <p style={{ fontSize: '12.5px', color: '#667085', margin: '4px 0 0' }}>
                        Customer orders, build queue progress, and automated PDF delivery logs.
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        style={{
                            padding: '0 14px',
                            height: '36px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            fontFamily: 'var(--ds-font-grotesk, sans-serif)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            borderRadius: '4px',
                            background: '#FFFFFF',
                            border: '1px solid #D0D5DD',
                            color: '#344054',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        title="Export orders list as CSV"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Print CSV
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="ds-card ds-admin-table-card" style={{ padding: '24px 28px' }}>
                {loading ? (
                    <Loader />
                ) : allOrders.length > 0 ? (
                    <Box className="ds-datagrid-container">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowHeight={72}
                            columnHeaderHeight={48}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            autoHeight
                        />
                    </Box>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>No customer orders placed yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersList;