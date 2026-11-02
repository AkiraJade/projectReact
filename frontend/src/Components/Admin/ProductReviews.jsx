import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';
import { exportToCsv } from '../../Utils/exportCsv';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Rating, Box, Button, TextField } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { toast } from 'react-toastify';

const ProductReviews = () => {
    const [selectedProduct, setSelectedProduct] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [allReviews, setAllReviews] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    const fetchAllReviews = async (productId = null) => {
        setLoading(true);
        try {
            const config = getAdminConfig();
            const url = productId && productId !== 'ALL'
                ? `${import.meta.env.VITE_API}/reviews?id=${productId}`
                : `${import.meta.env.VITE_API}/reviews`;

            const { data } = await axios.get(url, config);
            if (productId && productId !== 'ALL') {
                setAllReviews(data.reviews || []);
            } else {
                setAllReviews(data.reviews || []);
                if (data.products) {
                    setProductsList(data.products);
                }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error loading product reviews', {
                position: 'bottom-right'
            });
            setAllReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const handleProductChange = (e) => {
        const prodId = e.target.value;
        setSelectedProduct(prodId);
        fetchAllReviews(prodId);
    };

    const deleteReviewHandler = async (reviewId, productId) => {
        if (!window.confirm('Are you sure you want to move this review to Trash? It can be restored later.')) {
            return;
        }

        setDeletingId(reviewId);
        try {
            const config = getAdminConfig();
            const url = productId
                ? `${import.meta.env.VITE_API}/reviews?id=${reviewId}&productId=${productId}`
                : `${import.meta.env.VITE_API}/reviews?id=${reviewId}`;

            const { data } = await axios.delete(url, config);

            if (data.success) {
                toast.success('Review moved to Trash', { position: 'bottom-right' });
                // Remove from state or re-fetch
                fetchAllReviews(selectedProduct);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete review', {
                position: 'bottom-right'
            });
        } finally {
            setDeletingId(null);
        }
    };

    // Filter reviews by keyword (reviewer name, comment, product name)
    const filteredReviews = useMemo(() => {
        if (!searchTerm.trim()) return allReviews;
        const term = searchTerm.toLowerCase();
        return allReviews.filter((r) =>
            (r.name && r.name.toLowerCase().includes(term)) ||
            (r.comment && r.comment.toLowerCase().includes(term)) ||
            (r.productName && r.productName.toLowerCase().includes(term))
        );
    }, [allReviews, searchTerm]);

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            width: 120,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#667085' }}>
                        #{String(params.value).slice(-8).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            field: 'productName',
            headerName: 'Product',
            flex: 1.1,
            minWidth: 160,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', lineHeight: 1.3, minWidth: 0 }}>
                    <span style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        color: 'var(--ds-admin-text-main, #101828)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {params.value || 'Dosnoventa Product'}
                    </span>
                    {params.row.productId && (
                        <span style={{ fontFamily: 'monospace', fontSize: '10.5px', color: '#667085', marginTop: '3px' }}>
                            ID: {String(params.row.productId).slice(-8)}
                        </span>
                    )}
                </div>
            )
        },
        {
            field: 'user',
            headerName: 'Reviewer',
            flex: 1,
            minWidth: 140,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', lineHeight: 1.3, minWidth: 0 }}>
                    <span style={{
                        fontWeight: 600,
                        color: 'var(--ds-admin-text-main, #101828)',
                        fontSize: '13.5px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {params.row.userName}
                    </span>
                    <span style={{
                        fontSize: '11px',
                        color: '#16A34A',
                        fontWeight: 600,
                        marginTop: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        ✓ Verified Rider
                    </span>
                </div>
            )
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 140,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '100%' }}>
                    <Rating
                        value={Number(params.value) || 0}
                        readOnly
                        size="small"
                        precision={0.5}
                        emptyIcon={<StarIcon style={{ opacity: 0.25, color: '#9CA3AF' }} fontSize="inherit" />}
                        sx={{ color: '#C83226' }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#C83226' }}>
                        {params.value}
                    </span>
                </div>
            )
        },
        {
            field: 'comment',
            headerName: 'Review Commentary',
            flex: 2,
            minWidth: 220,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                    <span
                        title={params.value}
                        style={{
                            fontSize: '13px',
                            color: 'var(--ds-admin-text-muted, #344054)',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        “{params.value}”
                    </span>
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
                    <button
                        type="button"
                        disabled={deletingId === params.id}
                        onClick={() => deleteReviewHandler(params.id, params.row.productId)}
                        className="ds-table-action-btn ds-table-btn-trash"
                        title="Move review to trash"
                    >
                        <DeleteOutlineIcon style={{ fontSize: '14px' }} />
                        Trash
                    </button>
                </div>
            )
        }
    ];

    const rows = filteredReviews.map((review) => ({
        id: review._id,
        productId: review.productId,
        productName: review.productName,
        userName: review.name || 'Anonymous Rider',
        userId: review.user || 'N/A',
        rating: review.rating,
        comment: review.comment
    }));

    const handleExportCSV = () => {
        const exportColumns = [
            { label: 'Review ID', key: '_id' },
            { label: 'Product ID', key: 'productId' },
            { label: 'Product Name', key: 'productName' },
            { label: 'Customer Name', key: (r) => r.name || 'Anonymous Rider' },
            { label: 'Rating', key: 'rating' },
            { label: 'Comment', key: 'comment' },
            { label: 'Review Date', key: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '' },
        ];
        exportToCsv('product_reviews_audit', exportColumns, filteredReviews);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MetaData title="Product Reviews Audit — DOSNOVENTA" />

            {/* Header & Sub-Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ds-admin-text-main, #101828)', margin: 0 }}>
                        Product Reviews Moderation
                    </h2>
                    <p style={{ fontSize: '12.5px', color: 'var(--ds-admin-text-muted, #667085)', margin: '4px 0 0' }}>
                        Inspect verified customer reviews across all atelier builds, filter by bike model, or moderate content.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {filteredReviews.length > 0 && (
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
                            title="Export reviews list as CSV"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Print CSV
                        </button>
                    )}
                    <Link to="/admin/trash" className="ds-table-action-btn ds-table-btn-edit" style={{ padding: '8px 16px', fontSize: '11.5px', height: '36px' }}>
                        <DeleteSweepIcon style={{ fontSize: '15px' }} />
                        Trash & Archived
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="ds-card ds-admin-table-card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Product Selector Dropdown */}
                    <div style={{ flex: '1 1 260px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: 'var(--ds-admin-text-muted, #4B5563)',
                            marginBottom: '6px',
                            textTransform: 'uppercase'
                        }}>
                            Filter by Product ({productsList.length} with reviews)
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={handleProductChange}
                            style={{
                                width: '100%',
                                padding: '9px 12px',
                                background: 'var(--ds-admin-surface, #FFFFFF)',
                                border: '1px solid var(--ds-admin-border, #D1D5DB)',
                                borderRadius: '6px',
                                color: 'var(--ds-admin-text-main, #111827)',
                                fontSize: '13px',
                                fontWeight: 500,
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">All Products ({allReviews.length} Total Reviews)</option>
                            {productsList.map((prod) => (
                                <option key={prod._id} value={prod._id}>
                                    {prod.name} ({prod.reviewCount} review{prod.reviewCount > 1 ? 's' : ''})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search by text/reviewer */}
                    <div style={{ flex: '2 1 300px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: 'var(--ds-admin-text-muted, #4B5563)',
                            marginBottom: '6px',
                            textTransform: 'uppercase'
                        }}>
                            Search Customer or Comment
                        </label>
                        <div style={{ position: 'relative' }}>
                            <SearchIcon style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '18px',
                                color: '#9CA3AF'
                            }} />
                            <input
                                type="text"
                                placeholder="Filter by reviewer name, feedback keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '9px 12px 9px 36px',
                                    background: 'var(--ds-admin-surface, #FFFFFF)',
                                    border: '1px solid var(--ds-admin-border, #D1D5DB)',
                                    borderRadius: '6px',
                                    color: 'var(--ds-admin-text-main, #111827)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* DataGrid Table */}
            <div className="ds-card ds-admin-table-card" style={{ padding: '24px 28px' }}>
                {loading ? (
                    <Loader />
                ) : filteredReviews.length > 0 ? (
                    <Box className="ds-datagrid-container">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowHeight={76}
                            columnHeaderHeight={48}
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            autoHeight
                        />
                    </Box>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                            {searchTerm
                                ? `No reviews matched "${searchTerm}".`
                                : 'No active reviews found for the selected filter.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
