import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MetaData from '../Layout/MetaData';
import Loader from '../Layout/Loader';
import { getAdminConfig } from '../../Utils/helpers';

const TrashList = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'reviews' | 'users'
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ products: 0, reviews: 0, users: 0, total: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog state for confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    actionType: null, // 'restore' | 'permanent' | 'bulkRestore'
    targetId: null,
    extraData: null,
  });

  const fetchTrashCounts = async () => {
    try {
      const config = getAdminConfig();
      const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/counts`, config);
      if (data.success && data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.warn('Failed to load trash counts');
    }
  };

  const fetchTrashItems = async (tab = activeTab) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const config = getAdminConfig();
      if (tab === 'products') {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/products`, config);
        setProducts(data.products || []);
      } else if (tab === 'reviews') {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/reviews`, config);
        setReviews(data.reviews || []);
      } else if (tab === 'users') {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/trash/users`, config);
        setUsers(data.users || []);
      }
      fetchTrashCounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashItems(activeTab);
  }, [activeTab]);

  // Handle Restore
  const handleRestore = async (id, extra = null) => {
    setActionLoading(true);
    try {
      const config = getAdminConfig();
      if (activeTab === 'products') {
        await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}/restore`, {}, config);
        toast.success('Product restored successfully', { position: 'bottom-right' });
      } else if (activeTab === 'reviews') {
        await axios.put(
          `${import.meta.env.VITE_API}/admin/review/restore?id=${id}&productId=${extra?.productId}`,
          {},
          config
        );
        toast.success('Review restored successfully', { position: 'bottom-right' });
      } else if (activeTab === 'users') {
        await axios.put(`${import.meta.env.VITE_API}/admin/user/${id}/restore`, {}, config);
        toast.success('Customer account restored successfully', { position: 'bottom-right' });
      }
      fetchTrashItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore item', { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null });
    }
  };

  // Handle Permanent Delete
  const handlePermanentDelete = async (id, extra = null) => {
    setActionLoading(true);
    try {
      const config = getAdminConfig();
      if (activeTab === 'products') {
        await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}/permanent`, config);
        toast.success('Product permanently deleted from database', { position: 'bottom-right' });
      } else if (activeTab === 'reviews') {
        await axios.delete(
          `${import.meta.env.VITE_API}/admin/review/permanent?id=${id}&productId=${extra?.productId}`,
          config
        );
        toast.success('Review permanently deleted', { position: 'bottom-right' });
      } else if (activeTab === 'users') {
        await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}/permanent`, config);
        toast.success('Customer account permanently deleted', { position: 'bottom-right' });
      }
      fetchTrashItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete permanently', { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null });
    }
  };

  // Handle Bulk Restore for Products
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const config = getAdminConfig();
      config.headers = { ...config.headers, 'Content-Type': 'application/json' };
      const { data } = await axios.put(
        `${import.meta.env.VITE_API}/admin/products/bulk/restore`,
        { ids: selectedIds },
        config
      );
      toast.success(data.message || `${selectedIds.length} item(s) restored`, { position: 'bottom-right' });
      setSelectedIds([]);
      fetchTrashItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk restore failed', { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null });
    }
  };

  // Column definitions for Products Trash
  const productColumns = [
    {
      field: 'name',
      headerName: 'Product',
      flex: 2,
      minWidth: 260,
      renderCell: (params) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          minWidth: 0,
          height: '100%'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {params.row.image ? (
              <img
                src={params.row.image}
                alt={params.value}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#98a2b3',
                letterSpacing: '0.05em',
                fontFamily: 'var(--ds-font-grotesk, sans-serif)'
              }}>
                NO IMG
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            overflow: 'hidden',
            lineHeight: 1.3
          }}>
            <span
              style={{
                fontWeight: 600,
                color: '#101828',
                fontSize: '13.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
              title={params.value}
            >
              {params.value}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#667085',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--ds-font-grotesk, sans-serif)',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
            >
              {params.row.category || 'General'}
            </span>
          </div>
        </div>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <span style={{
          fontFamily: 'var(--ds-font-grotesk, sans-serif)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          color: '#101828',
          fontSize: '14px'
        }}>
          ${Number(params.value).toFixed(2)}
        </span>
      ),
    },
    {
      field: 'deletedAt',
      headerName: 'Deleted Date',
      width: 140,
      renderCell: (params) => <span style={{ fontSize: '13px', color: '#475467' }}>{params.value}</span>,
    },
    {
      field: 'deletedBy',
      headerName: 'Deleted By',
      width: 160,
      renderCell: (params) => <span style={{ fontSize: '13px', color: '#475467' }}>{params.value || 'Administrator'}</span>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 190,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-restore"
            title="Restore product to active collection"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Restore Product',
                message: `Are you sure you want to restore "${params.row.name}" back to the active catalog?`,
                actionType: 'restore',
                targetId: params.id,
              })
            }
          >
            Restore
          </button>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-trash"
            title="Permanently erase product"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Permanent Delete Product',
                message: `WARNING: Are you sure you want to PERMANENTLY erase "${params.row.name}"? This operation cannot be undone.`,
                actionType: 'permanent',
                targetId: params.id,
              })
            }
          >
            Purge
          </button>
        </div>
      ),
    },
  ];

  // Column definitions for Reviews Trash
  const reviewColumns = [
    {
      field: 'productName',
      headerName: 'Product',
      width: 220,
      renderCell: (params) => <strong style={{ color: '#101828', fontSize: '13.5px', fontWeight: 600 }}>{params.value}</strong>,
    },
    {
      field: 'userName',
      headerName: 'Reviewer',
      width: 160,
      renderCell: (params) => <span style={{ color: '#475467', fontSize: '13px' }}>{params.value}</span>,
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <span style={{ color: '#D97706', fontWeight: 700, fontSize: '13px' }}>★ {params.value}</span>,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 1.5,
      renderCell: (params) => <span style={{ fontSize: '13px', color: '#475467' }}>{params.value}</span>,
    },
    {
      field: 'deletedAt',
      headerName: 'Deleted Date',
      width: 140,
      renderCell: (params) => <span style={{ fontSize: '13px', color: '#475467' }}>{params.value}</span>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 190,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-restore"
            title="Restore review"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Restore Review',
                message: `Restore this review by ${params.row.userName} for "${params.row.productName}"?`,
                actionType: 'restore',
                targetId: params.id,
                extraData: { productId: params.row.productId },
              })
            }
          >
            Restore
          </button>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-trash"
            title="Permanently remove review"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Permanent Delete Review',
                message: 'Permanently remove this review from the system? This cannot be undone.',
                actionType: 'permanent',
                targetId: params.id,
                extraData: { productId: params.row.productId },
              })
            }
          >
            Purge
          </button>
        </div>
      ),
    },
  ];

  // Column definitions for Customers Trash
  const userColumns = [
    {
      field: 'name',
      headerName: 'Customer Name',
      flex: 1.2,
      renderCell: (params) => <strong style={{ color: '#101828', fontSize: '13.5px', fontWeight: 600 }}>{params.value}</strong>,
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1.5,
      renderCell: (params) => <span style={{ color: '#475467', fontSize: '13px' }}>{params.value}</span>,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: () => (
        <span className="ds-table-badge ds-badge-danger">
          <span className="ds-table-badge-dot"></span>
          DEACTIVATED
        </span>
      ),
    },
    {
      field: 'deletedAt',
      headerName: 'Deactivated On',
      width: 140,
      renderCell: (params) => <span style={{ fontSize: '13px', color: '#475467' }}>{params.value}</span>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 190,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', width: '100%', height: '100%' }}>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-restore"
            title="Reactivate customer account"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Reactivate Customer Account',
                message: `Reactivate account for ${params.row.name} (${params.row.email})?`,
                actionType: 'restore',
                targetId: params.id,
              })
            }
          >
            Reactivate
          </button>
          <button
            type="button"
            className="ds-table-action-btn ds-table-btn-trash"
            title="Permanently erase account"
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Permanent Delete Account',
                message: `WARNING: Permanently delete ${params.row.name}'s account? Accounts with order records are strictly protected.`,
                actionType: 'permanent',
                targetId: params.id,
              })
            }
          >
            Purge
          </button>
        </div>
      ),
    },
  ];

  // Row formatting
  const productRows = products.map((p) => ({
    id: p._id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.images?.[0]?.url || '',
    deletedAt: p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'Recent',
    deletedBy: p.deletedBy?.name || p.deletedBy?.email || 'Admin',
  }));

  const reviewRows = reviews.map((r) => ({
    id: r._id,
    productId: r.productId,
    productName: r.productName,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    deletedAt: r.deletedAt ? new Date(r.deletedAt).toLocaleDateString() : 'Recent',
  }));

  const userRows = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    status: u.status || 'deactivated',
    deletedAt: u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : 'Recent',
  }));

  return (
    <div className="ds-card ds-admin-table-card" style={{ padding: '24px 28px' }}>
      <MetaData title="Trash & Recovery — DOSNOVENTA" />

      {/* Top Banner / Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="ds-eyebrow" style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#c83226', fontWeight: 700, textTransform: 'uppercase' }}>
            ATELIER RECOVERY VAULT
          </span>
          <h2 style={{ fontSize: '18px', fontFamily: 'var(--ds-font-grotesk)', fontWeight: 700, color: '#101828', margin: '4px 0 0', letterSpacing: '0.02em' }}>
            Trash & Soft-Deleted Records
          </h2>
          <p style={{ fontSize: '12.5px', color: '#667085', margin: '4px 0 0' }}>
            Safely restore items back to production or permanently purge unreferenced records.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f8f9fa', border: '1px solid #eaecf0', borderRadius: '4px', padding: '2px', gap: '2px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              background: activeTab === 'products' ? '#ffffff' : 'transparent',
              color: activeTab === 'products' ? '#101828' : '#667085',
              border: activeTab === 'products' ? '1px solid #eaecf0' : '1px solid transparent',
              padding: '7px 16px',
              fontSize: '11px',
              fontFamily: 'var(--ds-font-grotesk)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            Products ({counts.products || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              background: activeTab === 'reviews' ? '#ffffff' : 'transparent',
              color: activeTab === 'reviews' ? '#101828' : '#667085',
              border: activeTab === 'reviews' ? '1px solid #eaecf0' : '1px solid transparent',
              padding: '7px 16px',
              fontSize: '11px',
              fontFamily: 'var(--ds-font-grotesk)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            Reviews ({counts.reviews || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              background: activeTab === 'users' ? '#ffffff' : 'transparent',
              color: activeTab === 'users' ? '#101828' : '#667085',
              border: activeTab === 'users' ? '1px solid #eaecf0' : '1px solid transparent',
              padding: '7px 16px',
              fontSize: '11px',
              fontFamily: 'var(--ds-font-grotesk)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            Customers ({counts.users || 0})
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar (for products) */}
      {activeTab === 'products' && selectedIds.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, p: 1.5, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
          <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
            {selectedIds.length} product(s) selected
          </span>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<RestoreFromTrashIcon />}
            onClick={() =>
              setConfirmDialog({
                open: true,
                title: 'Bulk Restore Products',
                message: `Are you sure you want to restore ${selectedIds.length} selected products back to the catalog?`,
                actionType: 'bulkRestore',
              })
            }
            disabled={actionLoading}
            sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px' }}
          >
            {actionLoading ? 'RESTORING...' : `RESTORE SELECTED (${selectedIds.length})`}
          </Button>
        </Box>
      )}

      {/* Content Area */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader />
        </div>
      ) : (
        <Box className="ds-datagrid-container">
          {activeTab === 'products' && (
            <DataGrid
              rows={productRows}
              columns={productColumns}
              rowHeight={72}
              columnHeaderHeight={48}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelection) => {
                if (newSelection && newSelection.ids) {
                  setSelectedIds(Array.from(newSelection.ids));
                } else if (Array.isArray(newSelection)) {
                  setSelectedIds(newSelection);
                } else {
                  setSelectedIds([]);
                }
              }}
              rowSelectionModel={{
                type: 'include',
                ids: new Set(selectedIds)
              }}
              autoHeight
            />
          )}

          {activeTab === 'reviews' && (
            <DataGrid
              rows={reviewRows}
              columns={reviewColumns}
              rowHeight={72}
              columnHeaderHeight={48}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              autoHeight
            />
          )}

          {activeTab === 'users' && (
            <DataGrid
              rows={userRows}
              columns={userColumns}
              rowHeight={72}
              columnHeaderHeight={48}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              autoHeight
            />
          )}
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null })}
        PaperProps={{
          sx: {
            backgroundColor: '#181b1f',
            color: '#f6f5f1',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '400px',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: confirmDialog.actionType === 'permanent' ? '#ef4444' : '#fff' }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: 1.6 }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, title: '', message: '', actionType: null, targetId: null, extraData: null })}
            sx={{ color: '#aaa', fontFamily: 'monospace' }}
            disabled={actionLoading}
          >
            CANCEL
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.actionType === 'restore') {
                handleRestore(confirmDialog.targetId, confirmDialog.extraData);
              } else if (confirmDialog.actionType === 'permanent') {
                handlePermanentDelete(confirmDialog.targetId, confirmDialog.extraData);
              } else if (confirmDialog.actionType === 'bulkRestore') {
                handleBulkRestore();
              }
            }}
            variant="contained"
            color={confirmDialog.actionType === 'permanent' ? 'error' : 'success'}
            disabled={actionLoading}
            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
          >
            {actionLoading ? 'PROCESSING...' : confirmDialog.actionType === 'permanent' ? 'CONFIRM PURGE' : 'CONFIRM RESTORE'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TrashList;
