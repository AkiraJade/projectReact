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
        const config = {
            Processing: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
            Assembled: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
            Delivered: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
            Cancelled: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }
        }[status] || { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };

        return (
            <span style={{
                backgroundColor: config.bg,
                color: config.text,
                border: `1px solid ${config.border}`,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Order Reference',
            flex: 1.1,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                        #ORD-{params.value.slice(-8).toUpperCase()}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6B7280' }}>
                        {params.value}
                    </span>
                </div>
            )
        },
        {
            field: 'customer',
            headerName: 'Customer',
            flex: 1,
            renderCell: (params) => (
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'numofItems',
            headerName: 'Items',
            width: 80,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <span style={{ fontWeight: 600, color: '#374151' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'amount',
            headerName: 'Grand Total',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <span style={{ fontWeight: 700, color: '#111827', fontSize: '13.5px', fontFamily: 'monospace' }}>
                    ${Number(params.value).toFixed(2)}
                </span>
            )
        },
        {
            field: 'status',
            headerName: 'Fulfillment Status',
            width: 160,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => getStatusChip(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            sortable: false,
            filterable: false,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/admin/order/${params.row.rawId}`} style={{ textDecoration: 'none' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            sx={{
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderColor: '#D1D5DB',
                                color: '#374151',
                                '&:hover': {
                                    borderColor: '#111827',
                                    color: '#111827',
                                    backgroundColor: '#F3F4F6'
                                }
                            }}
                            title="Process and update fulfillment"
                        >
                            <VisibilityIcon fontSize="small" />
                        </Button>
                    </Link>
                    {params.row.status !== 'Delivered' && (
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={deletingId === params.row.rawId}
                            onClick={() => deleteOrderHandler(params.row.rawId, params.row.status)}
                            sx={{
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderColor: '#FCA5A5',
                                color: '#DC2626',
                                '&:hover': {
                                    backgroundColor: '#FEF2F2',
                                    borderColor: '#EF4444'
                                }
                            }}
                            title="Cancel / delete unfulfilled order"
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const rows = allOrders.map((order) => ({
        id: order._id,
        rawId: order._id,
        customer: order.user?.name || order.shippingInfo?.city || 'Guest Rider',
        numofItems: order.orderItems?.length || 0,
        amount: order.totalPrice,
        status: order.orderStatus,
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MetaData title="Orders & Fulfillment — DOSNOVENTA" />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        Orders & Fulfillment
                    </h2>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '4px 0 0' }}>
                        Customer orders, build queue progress, and automated PDF delivery logs.
                    </p>
                </div>
            </div>

            {/* Content Card */}
            <div className="ds-card" style={{ padding: '24px 28px' }}>
                {loading ? (
                    <Loader />
                ) : allOrders.length > 0 ? (
                    <Box
                        sx={{
                            width: '100%',
                            '& .MuiDataGrid-root': {
                                border: '1px solid #EAECF0',
                                borderRadius: '8px',
                                color: '#111827',
                                fontFamily: 'inherit',
                                backgroundColor: '#FFFFFF',
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #F2F4F7',
                                fontSize: '13px',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#F8F9FA',
                                borderBottom: '1px solid #EAECF0',
                                color: '#4B5563',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#F8FAFC',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #EAECF0',
                                backgroundColor: '#FFFFFF',
                                color: '#6B7280',
                            },
                            '& .MuiTablePagination-root': {
                                color: '#4B5563',
                                fontSize: '12px',
                            },
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
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