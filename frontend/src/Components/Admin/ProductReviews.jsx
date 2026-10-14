import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getToken, getAdminConfig } from '../../Utils/helpers';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Rating, Box, Typography, Button, TextField } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';

const ProductReviews = () => {
    const [productId, setProductId] = useState('');
    const [searchedId, setSearchedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [listReviews, setListReviews] = useState([]);
    const [targetProduct, setTargetProduct] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const getProductReviews = async (id) => {
        if (!id || !id.trim()) {
            toast.warn('Please enter a valid Product ID', { position: 'bottom-right' });
            return;
        }

        setLoading(true);
        try {
            const config = getAdminConfig();
            const { data } = await axios.get(`${import.meta.env.VITE_API}/reviews?id=${id.trim()}`, config);
            setListReviews(data.reviews || []);
            setTargetProduct(data.product || null);
            setSearchedId(id.trim());
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error fetching reviews for this product', {
                position: 'bottom-right'
            });
            setListReviews([]);
            setTargetProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const deleteReviewHandler = async (reviewId) => {
        if (!window.confirm('Are you sure you want to move this review to Trash? It can be restored later.')) {
            return;
        }

        setDeletingId(reviewId);
        try {
            const config = getAdminConfig();
            const { data } = await axios.delete(
                `${import.meta.env.VITE_API}/reviews?id=${reviewId}&productId=${searchedId}`,
                config
            );

            if (data.success) {
                toast.success('Review moved to Trash', { position: 'bottom-right' });
                // Re-fetch reviews
                getProductReviews(searchedId);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete review', {
                position: 'bottom-right'
            });
        } finally {
            setDeletingId(null);
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();
        getProductReviews(productId);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Review ID',
            flex: 0.8,
            renderCell: (params) => (
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9CA3AF' }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'user',
            headerName: 'Reviewer',
            flex: 1,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>
                        {params.row.userName}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>
                        {params.row.userId}
                    </span>
                </div>
            )
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 140,
            renderCell: (params) => (
                <Rating
                    value={Number(params.value) || 0}
                    readOnly
                    size="small"
                    precision={0.5}
                    emptyIcon={<StarIcon style={{ opacity: 0.25, color: '#9CA3AF' }} fontSize="inherit" />}
                    sx={{ color: '#C83226' }}
                />
            )
        },
        {
            field: 'comment',
            headerName: 'Comment',
            flex: 2,
            renderCell: (params) => (
                <span style={{ fontSize: '13px', color: '#374151', whiteSpace: 'normal', lineHeight: '1.4' }}>
                    {params.value}
                </span>
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
                <button
                    type="button"
                    disabled={deletingId === params.id}
                    onClick={() => deleteReviewHandler(params.id)}
                    style={{
                        padding: '5px 12px',
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#DC2626',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <DeleteOutlineIcon style={{ fontSize: '14px' }} />
                    Trash
                </button>
            )
        }
    ];

    const rows = listReviews.map((review) => ({
        id: review._id,
        userName: review.name || 'Anonymous Rider',
        userId: review.user || 'N/A',
        rating: review.rating,
        comment: review.comment
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <MetaData title="Product Reviews Audit — DOSNOVENTA" />

            {/* Header & Sub-Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', color: '#F9FAFB', margin: 0 }}>
                        PRODUCT REVIEWS MODERATION
                    </h2>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>
                        Inspect verified customer reviews, mask flagged language, or move inappropriate feedback to Trash.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/admin/trash" style={{ textDecoration: 'none' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DeleteSweepIcon />}
                            sx={{
                                color: '#9CA3AF',
                                borderColor: '#374151',
                                '&:hover': { borderColor: '#C83226', color: '#fff' }
                            }}
                        >
                            Trash & Archived
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search Box */}
            <div className="ds-card" style={{ padding: '24px 28px' }}>
                <form onSubmit={submitHandler} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.04em', color: '#4B5563', marginBottom: '8px', textTransform: 'uppercase' }}>
                            ENTER PRODUCT OBJECT ID
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 660f1b2c456a789de0123456"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: '#FFFFFF',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                color: '#111827',
                                fontSize: '13.5px',
                                fontFamily: 'monospace',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={<SearchIcon />}
                        sx={{
                            background: '#C83226',
                            color: '#fff',
                            fontWeight: 600,
                            padding: '10px 24px',
                            borderRadius: '6px',
                            textTransform: 'none',
                            '&:hover': { background: '#A1261C' }
                        }}
                    >
                        {loading ? 'Searching...' : 'Find Reviews'}
                    </Button>
                </form>

                {searchedId && targetProduct && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #EAECF0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {targetProduct.images && targetProduct.images[0] && (
                            <img
                                src={targetProduct.images[0].url}
                                alt={targetProduct.name}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }}
                            />
                        )}
                        <div>
                            <div style={{ color: '#111827', fontWeight: 600, fontSize: '14px' }}>
                                {targetProduct.name}
                            </div>
                            <div style={{ color: '#6B7280', fontSize: '12px' }}>
                                Product ID: <span style={{ fontFamily: 'monospace' }}>{targetProduct._id}</span> • Total Active Reviews: {listReviews.length}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* DataGrid Table */}
            <div className="ds-card" style={{ padding: '24px 28px' }}>
                {loading ? (
                    <Loader />
                ) : listReviews.length > 0 ? (
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
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            autoHeight
                        />
                    </Box>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6B7280' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            {searchedId
                                ? 'No active reviews found for this product. (Soft-deleted reviews are located in Trash).'
                                : 'Enter a Product ID above to inspect and manage customer reviews.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;